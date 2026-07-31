import { ProposalEvents, ProposalEventType } from '@dias/contracts';
import { EventPublisher } from '../application/ports';

type Handler = (event: ProposalEvents) => void;

export class InMemoryEventBus implements EventPublisher {
  private handlers: Map<string, Set<Handler>> = new Map();
  private wildcard: Set<Handler> = new Set();

  subscribe(type: ProposalEventType | '*', handler: Handler): void {
    if (type === '*') {
      this.wildcard.add(handler);
    } else {
      let set = this.handlers.get(type);
      if (!set) {
        set = new Set();
        this.handlers.set(type, set);
      }
      set.add(handler);
    }
  }

  publish(event: ProposalEvents): void {
    const typeHandlers = this.handlers.get(event.eventType);
    if (typeHandlers) {
      for (const handler of typeHandlers) handler(event);
    }
    for (const handler of this.wildcard) handler(event);
  }
}
