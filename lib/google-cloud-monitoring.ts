import { MetricServiceClient } from '@google-cloud/monitoring';

interface GoogleApiUsageStats {
  requestCount: number;
  errorCount: number;
  totalLatency: number;
  averageLatency: number;
  timeWindow: {
    start: Date;
    end: Date;
  };
  responseCodeStats: {
    [key: string]: number;
  };
}

class GoogleCloudMonitoringService {
  private client: MetricServiceClient | null = null;
  private projectId: string;
  private isEnabled: boolean;
  private initializationError: Error | null = null;

  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || '';
    
    // Check for credentials in multiple ways
    const hasFileCredentials = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const hasJsonCredentials = !!process.env.GOOGLE_CREDENTIALS_JSON;
    
    this.isEnabled = !!(this.projectId && (hasFileCredentials || hasJsonCredentials));
    
    if (!this.projectId) {
      console.log('GOOGLE_CLOUD_PROJECT_ID not set. Google Cloud monitoring disabled.');
    } else if (!hasFileCredentials && !hasJsonCredentials) {
      console.log('No Google Cloud credentials found. Google Cloud monitoring disabled.');
      console.log('Set either GOOGLE_APPLICATION_CREDENTIALS (file path) or GOOGLE_CREDENTIALS_JSON (JSON string)');
    }
  }

  /**
   * Lazy initialize the client only when needed
   */
  private async getClient(): Promise<MetricServiceClient | null> {
    // If monitoring is disabled, return null
    if (!this.isEnabled) {
      return null;
    }

    // If we already tried and failed, don't try again
    if (this.initializationError) {
      return null;
    }

    // If client already initialized, return it
    if (this.client) {
      return this.client;
    }

    // Try to initialize the client
    try {
      // Check if we have JSON credentials as a string (for Vercel)
      if (process.env.GOOGLE_CREDENTIALS_JSON && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // Parse the JSON and create client with explicit credentials
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
        this.client = new MetricServiceClient({
          credentials,
          projectId: this.projectId
        });
      } else {
        // Use default behavior (file-based credentials)
        this.client = new MetricServiceClient();
      }
      return this.client;
    } catch (error) {
      this.initializationError = error as Error;
      console.log('Google Cloud monitoring client initialization failed. Monitoring disabled.');
      console.error('Error details:', error);
      return null;
    }
  }

  /**
   * Get API usage statistics for the Gemini API (generativelanguage.googleapis.com)
   */
  async getGeminiApiUsage(timeRangeHours = 24): Promise<GoogleApiUsageStats> {
    // Check if monitoring is enabled
    if (!this.isEnabled) {
      return this.getEmptyStats(timeRangeHours);
    }

    // Try to get client
    const client = await this.getClient();
    if (!client) {
      return this.getEmptyStats(timeRangeHours);
    }

    const projectName = `projects/${this.projectId}`;
    const now = new Date();
    const startTime = new Date(now.getTime() - timeRangeHours * 60 * 60 * 1000);

    // Create time interval
    const interval = {
      endTime: {
        seconds: Math.floor(now.getTime() / 1000),
        nanos: (now.getTime() % 1000) * 1000000,
      },
      startTime: {
        seconds: Math.floor(startTime.getTime() / 1000),
        nanos: (startTime.getTime() % 1000) * 1000000,
      },
    };

    try {
      // Fetch API request count
      const requestCountData = await this.fetchMetric(
        projectName,
        'serviceruntime.googleapis.com/api/request_count',
        interval
      );

      // Fetch request latencies
      const latencyData = await this.fetchMetric(
        projectName,
        'serviceruntime.googleapis.com/api/request_latencies',
        interval
      );

      // Process the data
      const stats = this.processUsageData(requestCountData, latencyData, {
        start: startTime,
        end: now,
      });

      return stats;
    } catch (error) {
      console.error('Error fetching Google Cloud monitoring data:', error);
      // Return empty stats instead of throwing to prevent API failures
      return this.getEmptyStats(timeRangeHours);
    }
  }

  /**
   * Return empty stats structure when monitoring data is unavailable
   */
  private getEmptyStats(timeRangeHours: number): GoogleApiUsageStats {
    const now = new Date();
    const startTime = new Date(now.getTime() - timeRangeHours * 60 * 60 * 1000);
    
    return {
      requestCount: 0,
      errorCount: 0,
      totalLatency: 0,
      averageLatency: 0,
      timeWindow: {
        start: startTime,
        end: now,
      },
      responseCodeStats: {},
    };
  }

  /**
   * Fetch a specific metric from Google Cloud Monitoring
   */
  private async fetchMetric(
    projectName: string,
    metricType: string,
    interval: any
  ): Promise<any[]> {
    const filter = `
      metric.type = "${metricType}" AND
      resource.type = "consumed_api" AND
      resource.labels.service = "generativelanguage.googleapis.com"
    `.trim();

    const request: any = {
      name: projectName,
      filter,
      interval,
      // Use string literal instead of enum reference that might be undefined
      view: 'FULL' as any,
    };

    try {
      const client = await this.getClient();
      if (!client) {
        return [];
      }
      
      const [timeSeries] = await client.listTimeSeries(request);
      return timeSeries || [];
    } catch (error) {
      console.error(`Failed to fetch metric ${metricType}:`, error);
      // Return empty array instead of throwing to prevent cascade failures
      return [];
    }
  }

  /**
   * Process raw monitoring data into usable statistics
   */
  private processUsageData(
    requestData: any[],
    latencyData: any[],
    timeWindow: { start: Date; end: Date }
  ): GoogleApiUsageStats {
    let totalRequests = 0;
    let totalErrors = 0;
    let totalLatency = 0;
    let latencyCount = 0;
    const responseCodeStats: { [key: string]: number } = {};

    // Process request count data
    for (const series of requestData) {
      const responseCode = series.resource?.labels?.response_code || 'unknown';
      const responseCodeClass = series.metric?.labels?.response_code_class || 'unknown';

      for (const point of series.points || []) {
        const value = point.value?.int64Value 
          ? parseInt(point.value.int64Value.toString())
          : point.value?.doubleValue || 0;

        totalRequests += value;

        // Count errors (4xx and 5xx response codes)
        if (responseCodeClass.startsWith('4') || responseCodeClass.startsWith('5')) {
          totalErrors += value;
        }

        // Track response code statistics
        responseCodeStats[responseCode] = (responseCodeStats[responseCode] || 0) + value;
      }
    }

    // Process latency data
    for (const series of latencyData) {
      for (const point of series.points || []) {
        const latencyValue = point.value?.distributionValue?.mean || 0;
        if (latencyValue > 0) {
          totalLatency += latencyValue;
          latencyCount++;
        }
      }
    }

    const averageLatency = latencyCount > 0 ? totalLatency / latencyCount : 0;

    return {
      requestCount: totalRequests,
      errorCount: totalErrors,
      totalLatency,
      averageLatency,
      timeWindow,
      responseCodeStats,
    };
  }

  /**
   * Get usage data for a specific time period
   */
  async getUsageForPeriod(
    startDate: Date,
    endDate: Date
  ): Promise<GoogleApiUsageStats> {
    const hours = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
    return this.getGeminiApiUsage(hours);
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return this.isEnabled;
  }

  /**
   * Test the connection to Google Cloud Monitoring
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.isEnabled) {
        return false;
      }

      const client = await this.getClient();
      if (!client) {
        return false;
      }

      // Try to list metrics to test the connection
      const projectName = `projects/${this.projectId}`;
      const [response] = await client.listMetricDescriptors({
        name: projectName,
        pageSize: 1,
      });

      return response.length >= 0; // Even empty response means connection works
    } catch (error) {
      console.error('Google Cloud Monitoring connection test failed:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const googleCloudMonitoring = new GoogleCloudMonitoringService();

// Export types for use in other modules
export type { GoogleApiUsageStats };