// Vue2.X Diff —— 双端比较
// 所谓双端比较就是新列表和旧列表两个列表的头与尾互相对比，，在对比的过程中指针会逐渐向内靠拢，直到某一个列表的节点全部遍历过，对比停止。

function vue2Diff(prevChildren, nextChildren, parent) {
  let oldStartIndex = 0, oldEndIndex = prevChildren.length - 1
  let newStartIndex = 0, oldStartIndex = nextChildren.length - 1
  let oldStartNode = prevChildren[oldStartIndex],
    oldEndNode = prevChildren[oldEndIndex],
    newStartNode = nextChildren[newStartIndex],
    newEndNode = nextChildren[newEndIndex]

  // 1.比较新旧头结点 2.比较新旧尾结点 3.比较旧头新尾结点 4.比较旧尾新头结点
  // 如果以上找不到，则查找新头结点在旧对应的结点，有则复用并把旧列表中该项设为undefined，没有就添加该结点到头
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 遇到undefined则跳过该节点
    if (oldStartNode === undefined) {
      oldStartNode = prevChildren[++oldStartIndex]
    } else if (oldEndNode === undefined) {
      oldEndNode = prevChildren[--oldEndIndex]
    } else if (oldStartNode.key === newStartNode.key) {
      patch(oldStartNode, newStartNode, parent)

      oldStartIndex++
      newStartIndex++
      oldStartNode = prevChildren[oldStartIndex]
      newStartNode = nextChildren[newStartIndex]
    } else if (oldEndNode.key === newEndNode.key) {
      patch(oldEndNode, newEndNode, parent)

      oldEndIndex--
      newEndIndex--
      oldEndNode = prevChildren[oldEndIndex]
      newEndNode = nextChildren[newEndIndex]
    } else if (oldStartNode.key === newEndNode.key) {
      patch(oldStartNode, newEndNode, parent)
      parent.insertBefore(oldStartNode.el, oldEndNode.el.nextSibling)

      oldStartIndex++
      newEndIndex--
      oldStartNode = prevChildren[oldStartIndex]
      newEndNode = nextChildren[newEndIndex]
    } else if (oldEndNode.key === newStartNode.key) {
      patch(oldEndNode, newStartNode, parent)
      // 移动到新列表头节点之前
      parent.insertBefore(oldEndNode.el, oldStartNode.el)

      oldEndIndex--
      nextStartIndex++
      oldEndNode = prevChildren[oldEndIndex]
      newStartNode = nextChildren[newStartIndex]
    } else {
      let newKey = newStartNode.key,
        oldIndex = prevChildren.findIndex(child => child.key === newKey)
      
      if (oldIndex > -1) {
        let oldNode = prevChildren[oldIndex]
        patch(oldNode, newStartNode, parent)
        parent.insertBefore(oldNode.el, oldStartNode.el)
        prevChildren[oldIndex] = undefined
      } else {
        mount(newStartNode, parent, oldStartNode.el)
      }
      newStartNode = nextChildren[++newStartIndex]
    }
  }

  // 循环结束后，看看新旧列表中是否有剩余结点，新列表中有剩余则添加这些结点，旧列表有剩余则删除这些结点
  if (oldEndIndex < oldStartIndex) {
    for(let i = newStartIndex; i <= newEndIndex; i++) {
      mount(nextChildren[i], parent, oldStartNode.el)
    }
  } else if (newEndIndex < newStartIndex) {
    for(let i = oldStartIndex; i <= oldEndIndex; i++) {
      if (prevChildren[i]) {
        parent.removeChild(prevChildren[i].el)
      }
    }
  }
}
