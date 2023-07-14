export class PairingHeap {
  #comparator;
  #heap;
  #n;

  constructor(comparator) {
    this.#comparator = comparator;
    this.#heap = null;
    this.#n = 0;
  }

  isEmpty() {
    return !this.#heap;
  }

  min() {
    if (this.isEmpty()) {
      throw new Error("Heap is empty.");
    }
    return this.#heap.elem;
  }

  insert(elem) {
    this.#n++;
    this.#heap = this.#meld(this.#heap, { elem, subheaps: [] });
  }

  #meld(heap1, heap2) {
    if (!heap1) {
      return heap2;
    } else if (!heap2) {
      return heap1;
    } else if (this.#comparator(heap1.elem, heap2.elem) < 0) {
      return {
        elem: heap1.elem,
        subheaps: [heap2, ...heap1.subheaps],
      };
    } else {
      return {
        elem: heap2.elem,
        subheaps: [heap1, ...heap2.subheaps],
      };
    }
  }

  delMin() {
    this.#n--;
    const min = this.min();
    this.#heap = this.#mergePairs(this.#heap.subheaps);
    return min;
  }

  //   #mergePairs(heaps) {
  //     if (heaps.length === 0) {
  //       return null;
  //     } else if (heaps.length === 1) {
  //       return heaps[0];
  //     } else {
  //       const meldLeft = this.#meld(heaps[0], heaps[1]);
  //       return this.#meld(meldLeft, this.#mergePairs(heaps.slice(2)));
  //     }
  //   }

  #mergePairs(heaps) {
    if (heaps.length === 0) {
      return null;
    }
    const n = heaps.length;
    let forwardMelds = [];

    for (let i = 0; i < n; i += 2) {
      const left = heaps[i];
      const right = i + 1 < n ? heaps[i + 1] : null;
      forwardMelds.push(this.#meld(left, right));
    }

    let backwardMeld = forwardMelds.pop();
    while (forwardMelds.length > 0) {
      let left = forwardMelds.pop();
      backwardMeld = this.#meld(left, backwardMeld);
    }

    return backwardMeld;
  }
}
