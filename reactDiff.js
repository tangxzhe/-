// React的思路是递增法。通过对比新列表中的结点在旧列表中的位置是否递增，来判断当前结点是否需要移动
// 可以通过prevIndexMap， nextIndexMap优化
function reactDiff(prevList, nextList, parent) {
  let lastIndex = 0
  for(let i = 0; i < nextList.length; i++) {
    let nextItem = nextList[i]
    let find = false
    for(let j = 0; j < prevList.length; j++) {
      let prevItem = prevList[j]
      if (nextItem.key === prevItem.key) {
        find = true
        patch(prevItem, nextItem, parent)
        if (j < lastIndex) {
          // 新列表当前结点的在旧列表的位置小于新列表上一个结点在旧列表的位置，需要移动到前一个结点的后面
          let refNode = nextList[i - 1].el.nextSibling
          parent.insertBefore(nextItem.el, refNode)
        } else {
          // 不需要移动结点，将当前位置记录下来，与之后结点对比
          lastIndex = j
        }
      }
    }
    if (!find) {
      // 插入新节点
      let refNode = i <= 0 ? prevList[0].el : nextList[i - 1].el.nextSibling
      mount(nextItem, parent, refNode)
    }
  }

  // 删除结点
  for (let i = 0; i < prevList.length; i++) {
    let prevChild = prevChild[i]
    let has = nextList.find(item => item.key === prevChild.key)
    if (!has) parent.removeChild(prevChild.el)
  }
}
