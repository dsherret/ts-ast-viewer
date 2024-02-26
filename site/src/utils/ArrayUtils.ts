export function binarySearch<T>(
  items: ReadonlyArray<T>,
  compareTo: (value: T) => number,
) {
  let top = items.length - 1;
  let bottom = 0;

  while (bottom <= top) {
    const mid = Math.floor((top + bottom) / 2);
    const comparisonResult = compareTo(items[mid]);
    if (comparisonResult === 0) {
      return mid;
    } else if (comparisonResult < 0) {
      top = mid - 1;
    } else {
      bottom = mid + 1;
    }
  }

  return -1;
}

export function partition<T>(
  items: ReadonlyArray<T>,
  predicate: (value: T) => boolean,
): [T[], T[]] {
  const trueItems: T[] = [];
  const falseItems: T[] = [];

  for (let i = 0; i < items.length; i++) {
    if (predicate(items[i])) {
      trueItems.push(items[i]);
    } else {
      falseItems.push(items[i]);
    }
  }

  return [trueItems, falseItems];
}
