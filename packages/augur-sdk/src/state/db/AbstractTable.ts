import Dexie from 'dexie';
import * as _ from 'lodash';
import { AsyncQueue, queue } from 'async';

export type PrimitiveID = string | number | Date;

export type ID = PrimitiveID | Array<PrimitiveID>;

export const ALL_DOCS_BATCH_SIZE = 200;

export enum WriteTaskType {
  ADD,
  PUT,
  UPSERT,
}

interface WriteQueueTask {
  type: WriteTaskType;
  documents: BaseDocument[];
  table: AbstractTable;
}

export interface BaseDocument {
  [key: string]: any;
}

export abstract class AbstractTable {
  table: Dexie.Table<any, any>;
  protected networkId: number;
  readonly dbName: string;
  protected idFields: string[];
  protected syncing: boolean;

  private static writeQueue: AsyncQueue<WriteQueueTask> = queue(
    async (task: WriteQueueTask) => {
      if (task.type === WriteTaskType.ADD) {
        return task.table.bulkAddDocumentsInternal(task.documents);
      } else if (task.type === WriteTaskType.PUT) {
        return task.table.bulkPutDocumentsInternal(task.documents);
      } else {
        return task.table.bulkUpsertDocumentsInternal(task.documents);
      }
    },
    1
  );

  protected constructor(networkId: number, dbName: string, db: Dexie) {
    this.networkId = networkId;
    this.dbName = dbName;
    this.table = db[dbName];
    this.syncing = false;
    const keyPath = this.table.schema.primKey.keyPath;
    this.idFields = typeof keyPath === 'string' ? [keyPath] : keyPath;
  }

  async clearDB(): Promise<void> {
    await this.table.clear();
  }

  // We pull all docs in batches to avoid maximum IPC message errors
  async allDocs(): Promise<any[]> {
    const results: any[] = [];
    const documentCount = await this.getDocumentCount();
    for (let batchIdx = 0; batchIdx * ALL_DOCS_BATCH_SIZE <= documentCount; batchIdx++) {
      const batchResults = await this.table
        .offset(batchIdx * ALL_DOCS_BATCH_SIZE)
        .limit(ALL_DOCS_BATCH_SIZE)
        .toArray();
      results.push(...batchResults);
    }
    return results;
  }

  async delete() {
    await this.table.clear();
    return Dexie.delete(this.dbName);
  }

  async getDocumentCount(): Promise<number> {
    return this.table.count();
  }

  protected async getDocument<Document>(id: string): Promise<Document | undefined> {
    return this.table.get(id);
  }

  private async addWriteTask(type: WriteTaskType, documents: BaseDocument[]): Promise<void> {
    return new Promise((resolve, reject) => {
      AbstractTable.writeQueue.push({ table: this, documents, type }, (err) => {
        if (err) {
          reject(err);
        }
          resolve();
      });
    });
  }

  protected async bulkAddDocuments(documents: BaseDocument[]): Promise<void> {
    return this.addWriteTask(WriteTaskType.ADD, documents);
  }

  protected async bulkPutDocuments(documents: BaseDocument[], documentIds?: any[]): Promise<void> {
    return this.addWriteTask(WriteTaskType.PUT, documents);
  }

  protected async bulkUpsertDocuments(documents: BaseDocument[]): Promise<void> {
    return this.addWriteTask(WriteTaskType.UPSERT, documents);
  }

  protected async bulkAddDocumentsInternal(documents: BaseDocument[]): Promise<void> {
    for (const document of documents) {
      delete document.constructor;
    }
    await this.table.bulkAdd(documents);
  }

  protected async bulkPutDocumentsInternal(documents: BaseDocument[], documentIds?: any[]): Promise<void> {
    for (const document of documents) {
      delete document.constructor;
    }
    await this.table.bulkPut(documents);
  }

  protected async bulkUpsertDocumentsInternal(documents: BaseDocument[]): Promise<void> {
    const documentIds = _.map(documents, this.getIDValue.bind(this));
    const existingDocuments = await this.table.bulkGet(documentIds);
    let docIndex = 0;
    for (const existingDocument of existingDocuments) {
      existingDocuments[docIndex] = Object.assign({}, existingDocument || {}, documents[docIndex]);
      docIndex++;
    }
    await this.bulkPutDocumentsInternal(existingDocuments, documentIds);
  }

  protected async saveDocuments(documents: BaseDocument[]): Promise<void> {
    return this.bulkUpsertDocuments(documents);
  }

  protected async upsertDocument(documentID: ID, document: BaseDocument): Promise<void> {
    delete document.constructor;
    const result = await this.table.update(documentID, document);

    if (result === 0) {
      await this.table.add(document);
    }
  }

  async find(request: {}): Promise<Dexie.Collection<any, any>> {
    return this.table.where(request);
  }

  protected getIDValue(document: any): ID {
    if (this.idFields.length === 1) return _.get(document, this.idFields[0]);

    const id = [];
    for (const idField of this.idFields) {
      id.push(_.get(document, idField));
    }
    return id;
  }

}
