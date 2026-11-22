import { AsyncLocalStorage } from 'node:async_hooks';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EntitySubscriberInterface, EventSubscriber, TransactionStartEvent } from 'typeorm';
import type { User } from '../users/entities/user.entity';

const actorContext = new AsyncLocalStorage<Pick<User, 'id' | 'username'>>();

@Injectable()
export class AuditActorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const { user, method } = context.switchToHttp().getRequest<{ user?: User; method: string }>();
    if (!user || ['GET', 'HEAD', 'OPTIONS'].includes(method)) return next.handle();

    const actor = { id: user.id, username: user.username };
    return new Observable(subscriber =>
      actorContext.run(actor, () => next.handle().subscribe(subscriber)),
    );
  }
}

@EventSubscriber()
export class AuditActorSubscriber implements EntitySubscriberInterface {
  async afterTransactionStart({ queryRunner }: TransactionStartEvent): Promise<void> {
    const actor = actorContext.getStore();
    if (!actor) return;
    // Transaction-local settings disappear on both commit and rollback.
    await queryRunner.query(
      "SELECT set_config('tnis.actor_id', $1, true), set_config('tnis.username', $2, true)",
      [actor.id, actor.username],
    );
  }
}
