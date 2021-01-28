
function vue3Diff(prevChildren, nextChildren, parent) {
  let j = 0,
    prevEnd = prevChildren.length - 1,
    nextEnd = nextChildren.length - 1,
    prevNode = prevChildren[j],
    nextNode = nextChildren[j]
  
  outer: {
    while (prevNode.key === nextNode.key) {
      patch(prevNode, nextNode, parent)
      j++
      // 循环中如果触发边界情况，直接break，执行outer之后的判断
      if (j > prevEnd || j > nextEnd) break outer
      prevNode = prevChildren[j]
      nextNode = nextChildren[j]
    }

    prevNode = prevChildren[prevEnd]
    nextNode = prevChildren[nextEnd]

    while (prevNode.key === nextNode.key) {
      patch(prevNode, nextNode, parent)
      prevEnd--
      nextEnd--
      // 循环中如果触发边界情况，直接break，执行outer之后的判断
      if (j > prevEnd || j > nextEnd) break outer
      prevNode = prevChildren[prevEnd]
      nextNode = nextChildren[nextEnd]
    }
  }
  
  if (j > prevEnd && j <= nextEnd) {
    let nextPos = nextEnd + 1,
      refNode = nextPos >= nextChildren.length ? null : nextChildren[nextPos].el
    while (j <= nextEnd) mount(nextChildren[j++], parent, refNode)
  } else if (j > nextEnd && j <= prevEnd) {
    while (j <= prevEnd) parent.removeChild(prevChildren[j++].el)
  } else {
    let prevStart = j,
      nextStart = j,
      nextLeft = nextEnd - nextStart + 1 // 新列表中剩余结点长度
    // 创建数组，填满-1，存储新列表结点在旧列表中的位置
    let source = new Array(nextLeft).fill(-1)
    let nextIndexMap = {}, // 新列表节点与index的映射
      patched = 0, // 已更新过的节点的数量
      move = false, // 是否移动
      lastIndex = 0 // 记录上一次的位置
    // 保存映射关系
    for (let i = nextStart; i <= nextEnd; i++) {
      let key = nextChildren[i].key
      nextIndexMap[key] = i
    }

    for (let i = prevStart; i <= prevEnd; i++) {
      let prevNode = prevChildren[i],
        prevKey  = prevNode.key,
        nextIndex = nextIndexMap[prevKey]
      if (nextIndex === undefined || patched >= nextLeft) {
        parent.removeChild(prevNode.el)
        continue
      }
      // 找到对应结点
      let nextNode = nextChildren[nextIndex]
      patch(prevNode, nextNode, parent)
      source[nextIndex - nextStart] = i
      patched++

      if (nextIndex < lastIndex) {
        move = true
      } else {
        lastIndex = nextIndex
      }
    }

    if (move) {
      const seq = lis(source)
      let j = seq.length - 1
      // 从后往前遍历
      for (let i = nextLeft - 1； i >= 0; i--) {
        let pos = nextStart + i, // 对应新列表的index
        nextNode = nextChildren[pos],
        nextPos = pos + 1 // 下一个结点的位置，用于移动dom
        refNode = nextPos >= nextChildren.length ? null : nextChildren[nextPos].el
        cur = source[i] // 当前source的值，用于判断结点是否需要移动
        if (cur === -1) {
          // 情况1，新增结点
          mount(nextNode, parent, refNode)
        } else if (i === seq[j]) {
          // 情况2，是递增子序列，该节点不需要移动
          j--
        } else {
          parent.insertBefore(nextNode.el, refNode)
        }
      }
    } else {
      // 不需要移动
      for (let i = nextLeft - 1； i >= 0; i--) {
        let cur = source[i]
        if (cur === -1) {
          let pos = nextStart + i,
            nextNode = nextChildren[pos],
            nextPos = pos + 1
            refNode = nextPos >= nextChildren.length ? null : nextChildren[nextPos].el
          mount(nextNode, parent, refNode)
        }
      }
    }
  }
}

function lis(arr) {
  let len = arr.length,
    result = [],
    dp = new Array(len).fill(1);
  for (let i = 0; i < len; i++) {
    result.push([i])
  }

  for (let i = len - 1; i >= 0; i--) {
    let cur = arr[i],
      nextIndex = undefined;
    if (cur === -1) continue
    for (let j = i + 1; j < len; j++) {
      let next = arr[j]
      if (cur < next) {
        let max = dp[j] + 1
        if (max > dp[i]) {
          nextIndex = j
          dp[i] = max
        }
      }
    }
    if (nextIndex !== undefined) result[i] = [...result[i], ...result[nextIndex]]
  }
  let index = dp.reduce((prev, cur, i, arr) => cur > arr[prev] ? i : prev, dp.length - 1)
  return result[index]
}
