# Chat Systems Dependency Diagram

## Visual Architecture Overview

```mermaid
graph TB
    subgraph "Current Architecture"
        subgraph "app/(chat) Layout Group"
            CL[Chat Layout<br/>- SidebarProvider<br/>- DataStreamProvider<br/>- AppSidebar]
            StorePage[Store Page<br/>app/chat/page.tsx]
            ChatPages[Chat Pages<br/>chat/id]
            
            CL --> StorePage
            CL --> ChatPages
        end
        
        subgraph "Store Chat System"
            SCW[Store Chat Widget]
            SCA[api/store-chat]
            SCH[useStoreChat Hook]
            Gemini[Google Gemini API<br/>Direct Calls]
            
            StorePage --> SCW
            SCW --> SCH
            SCH --> SCA
            SCA --> Gemini
        end
        
        subgraph "Main Chat System"
            MC[Main Chat UI]
            MCA[api/chat<br/>+ sub-routes]
            AISDK[Vercel AI SDK v5]
            Artifacts[Artifact System]
            
            ChatPages --> MC
            MC --> MCA
            MCA --> AISDK
            MC --> Artifacts
        end
        
        subgraph "Shared Dependencies"
            Auth[NextAuth]
            UI[UI Components<br/>Button, Sheet, etc]
            Utils[Utilities<br/>Rate Limit, Validation]
            DB[Database Schema]
            
            StorePage --> Auth
            ChatPages --> Auth
            StorePage --> UI
            MC --> UI
            SCA --> Utils
            MCA --> Utils
        end
    end
    
    style StorePage fill:#90EE90,stroke:#333,stroke-width:2px,color:#000
    style SCW fill:#90EE90,stroke:#333,stroke-width:2px,color:#000
    style SCA fill:#90EE90,stroke:#333,stroke-width:2px,color:#000
    style SCH fill:#90EE90,stroke:#333,stroke-width:2px,color:#000
    style Gemini fill:#90EE90,stroke:#333,stroke-width:2px,color:#000
    
    style ChatPages fill:#FFB6C1,stroke:#333,stroke-width:2px,color:#000
    style MC fill:#FFB6C1,stroke:#333,stroke-width:2px,color:#000
    style MCA fill:#FFB6C1,stroke:#333,stroke-width:2px,color:#000
    style AISDK fill:#FFB6C1,stroke:#333,stroke-width:2px,color:#000
    style Artifacts fill:#FFB6C1,stroke:#333,stroke-width:2px,color:#000
    style CL fill:#FFB6C1,stroke:#333,stroke-width:2px,color:#000
```

## Proposed Architecture (After Separation)

```mermaid
graph TB
    subgraph "Simplified Architecture"
        subgraph "Root Level"
            StorePage2[Store Page<br/>app/page.tsx]
        end
        
        subgraph "Store Chat System (Unchanged)"
            SCW2[Store Chat Widget]
            SCA2[api/store-chat]
            SCH2[useStoreChat Hook]
            Gemini2[Google Gemini API<br/>Direct Calls]
            
            StorePage2 --> SCW2
            SCW2 --> SCH2
            SCH2 --> SCA2
            SCA2 --> Gemini2
        end
        
        subgraph "Shared Dependencies (Preserved)"
            Auth2[NextAuth]
            UI2[UI Components]
            Utils2[Utilities]
            DB2[Database Schema<br/>minus chat tables]
            
            StorePage2 --> Auth2
            StorePage2 --> UI2
            SCA2 --> Utils2
        end
    end
    
    style StorePage2 fill:#90EE90,stroke:#333,stroke-width:2px,color:#000
    style SCW2 fill:#90EE90,stroke:#333,stroke-width:2px,color:#000
    style SCA2 fill:#90EE90,stroke:#333,stroke-width:2px,color:#000
    style SCH2 fill:#90EE90,stroke:#333,stroke-width:2px,color:#000
    style Gemini2 fill:#90EE90,stroke:#333,stroke-width:2px,color:#000
```

## Key Insights

### 🟢 Green = Keep (Store System)
- Completely independent implementation
- Direct Google Gemini API integration
- No Vercel AI SDK dependencies
- Works perfectly as-is

### 🔴 Red = Remove (Main Chat System)
- Heavy Vercel AI SDK v5 beta dependencies
- Causes all the TypeScript/build issues
- Not used by your store functionality
- 51+ files can be removed

### 🔵 Blue = Shared (Must Preserve)
- Authentication system (both use it)
- Basic UI components (Button, Sheet)
- Utility functions (rate limiting, validation)
- Some database tables

## The Critical Issue

**The store page is inside the (chat) layout group**, which wraps it with:
- SidebarProvider (not used by store)
- DataStreamProvider (not used by store)
- AppSidebar component (not shown on store page)

This is purely an organizational issue, not a functional dependency.

## Simple Solution

1. **Move** `/app/(chat)/page.tsx` → `/app/page.tsx`
2. **Delete** entire `/app/(chat)/chat` directory
3. **Delete** `/app/(chat)/layout.tsx`
4. **Remove** AI SDK packages from package.json
5. **Keep** everything in green above

This removes 51+ files and all the problematic beta dependencies while keeping your working store chat completely intact.