export interface TimelineResponse {
    data: {
      timeline: {
        [date: string]: {
          [entityId: string]: string[];
        };
      };
    };
    status: {
      code: number;
      message: string;
    };
  }
  
  export interface TimelineEntry {
    entityId: string;
    actions: string[];
    date: string;
  }
  
  export interface GroupedTimeline {
    [formattedDate: string]: TimelineEntry[];
  }