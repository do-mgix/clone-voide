export class CartRepository {
  load() {
    throw new Error('CartRepository.load must be implemented');
  }

  save(_cartAggregate) {
    throw new Error('CartRepository.save must be implemented');
  }
}
