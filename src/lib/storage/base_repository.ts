import {inject, injectable} from 'inversify';
import {QueryBuilder, IStorageDriver, Storage} from './storage';

@injectable()
export abstract class BaseRepository<T> {

	@inject(Storage) protected storage: IStorageDriver;

	abstract getCollectionPath(...documentIds: string[]): string;

	findById(...ids: string[]): Promise<T> {
		const docId = ids.pop();
		return this.storage.findById(this.getCollectionPath(...ids), docId);
	}

	find(attributes: T, ...ids: string[]): Promise<T> {
		return this.storage.find(this.getCollectionPath(...ids), (qb) => {
			return this.mapToWhereClause(qb, attributes);
		})
	}

	list(attributes?: T, ...ids: string[]): Promise<T[]> {
		return this.query((qb) => {
			return this.mapToWhereClause(qb, attributes);
		}, ...ids);
	}

	protected mapToWhereClause(query: QueryBuilder, attributes?: T): QueryBuilder {
		if (!attributes) {
			return query;
		}
		return Object.keys(attributes)
			.reduce((query, key) => {
				return query.where(key, '==', attributes[key])
			}, query);
	}

	query(cb: (qb: QueryBuilder) => QueryBuilder, ...ids: string[]): Promise<T[]> {
		return this.storage.query(this.getCollectionPath(...ids), cb);
	}

	batchGet(documentIds: string[], ...ids: string[]): Promise<T[]> {
		return this.storage.batchGet(this.getCollectionPath(...ids), documentIds);
	}

	save(data: T, ...ids: string[]): Promise<T> {
		return this.storage.save(this.getCollectionPath(...ids), data)
	}

	clear(...ids: string[]): Promise<void> {
		return this.storage.clear(this.getCollectionPath(...ids))
	}

	delete(...ids: string[]): Promise<void> {
		const docId = ids.pop();
		return this.storage.delete(this.getCollectionPath(...ids), docId);
	}

	listen(cb: (qb: QueryBuilder) => QueryBuilder, onNext, onError, ...ids: string[]) {
		return this.storage.listen(this.getCollectionPath(...ids), cb, onNext, onError);
	}

}
