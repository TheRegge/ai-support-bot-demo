export interface SecurityEvent {
  type: 'prompt_injection' | 'malicious_content' | 'bot_behavior' | 'rate_limit' | 'validation_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  clientIP: string;
  userAgent?: string;
  userId?: string;
  details: {
    originalMessage?: string;
    sanitizedMessage?: string;
    detectedPattern?: string;
    errorMessage?: string;
    additionalContext?: Record<string, unknown>;
  };
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private readonly maxEvents = 10000; // Keep last 10k events in memory

  logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now()
    };

    // Add to in-memory store
    this.events.push(fullEvent);
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`🔒 Security Event [${event.severity.toUpperCase()}]:`, {
        type: event.type,
        clientIP: event.clientIP,
        details: event.details
      });
    }

    // In production, you might want to send to external monitoring
    if (process.env.NODE_ENV === 'production' && event.severity === 'critical') {
      // TODO: Send to external security monitoring service
      console.error('CRITICAL SECURITY EVENT:', fullEvent);
    }
  }

  getRecentEvents(limit = 100): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  getEventsByType(type: SecurityEvent['type'], limit = 100): SecurityEvent[] {
    return this.events
      .filter(event => event.type === type)
      .slice(-limit);
  }

  getEventsByIP(clientIP: string, limit = 100): SecurityEvent[] {
    return this.events
      .filter(event => event.clientIP === clientIP)
      .slice(-limit);
  }

  getEventsBySeverity(severity: SecurityEvent['severity'], limit = 100): SecurityEvent[] {
    return this.events
      .filter(event => event.severity === severity)
      .slice(-limit);
  }

  clearEvents(): void {
    this.events = [];
  }
}

// Singleton instance
export const securityLogger = new SecurityLogger();

// Helper functions for common security events
export function logPromptInjection(
  clientIP: string,
  originalMessage: string,
  detectedPattern: string,
  userAgent?: string,
  userId?: string
): void {
  securityLogger.logSecurityEvent({
    type: 'prompt_injection',
    severity: 'high',
    clientIP,
    userAgent,
    userId,
    details: {
      originalMessage,
      detectedPattern,
      errorMessage: 'Prompt injection attempt detected'
    }
  });
}

export function logMaliciousContent(
  clientIP: string,
  originalMessage: string,
  detectedPattern: string,
  userAgent?: string,
  userId?: string
): void {
  securityLogger.logSecurityEvent({
    type: 'malicious_content',
    severity: 'medium',
    clientIP,
    userAgent,
    userId,
    details: {
      originalMessage,
      detectedPattern,
      errorMessage: 'Malicious content detected'
    }
  });
}

export function logBotBehavior(
  clientIP: string,
  errorMessage: string,
  messageCount: number,
  userAgent?: string,
  userId?: string
): void {
  securityLogger.logSecurityEvent({
    type: 'bot_behavior',
    severity: 'medium',
    clientIP,
    userAgent,
    userId,
    details: {
      errorMessage,
      additionalContext: { messageCount }
    }
  });
}

export function logRateLimit(
  clientIP: string,
  limitType: string,
  userAgent?: string,
  userId?: string
): void {
  securityLogger.logSecurityEvent({
    type: 'rate_limit',
    severity: 'low',
    clientIP,
    userAgent,
    userId,
    details: {
      errorMessage: `Rate limit exceeded: ${limitType}`
    }
  });
}

export function logValidationError(
  clientIP: string,
  errorMessage: string,
  originalMessage?: string,
  userAgent?: string,
  userId?: string
): void {
  securityLogger.logSecurityEvent({
    type: 'validation_error',
    severity: 'low',
    clientIP,
    userAgent,
    userId,
    details: {
      originalMessage,
      errorMessage
    }
  });
}