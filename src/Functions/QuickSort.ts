export function quickSort(array, left?, right?) {
    left = left || 0;
    right = right || array.length - 1;

    let pivot = partitionLomuto(array, left, right);

    if(left < pivot - 1) {
        quickSort(array, left, pivot - 1);
    }
    if(right > pivot) {
        quickSort(array, pivot, right);
    }
    return array;
}

function partitionLomuto(array, left, right) {
    let pivot = right;
    let i = left;
    let j;

    for(j = left; j < right; j++) {
        if(array[j].compare(array[pivot])) {
            swap(array, i , j);
            i = i + 1;
        }
    }
    swap(array, i, j);
    return i;
}

function swap(array, i, j) {
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
}