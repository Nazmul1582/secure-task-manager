export function getNextPosition(tasks, activeId, overId, nextStatus) {
  const activeTask = tasks.find((task) => task._id === activeId)

  if (!activeTask) {
    return Date.now()
  }

  const nextColumnTasks = tasks
    .filter((task) => task._id !== activeId && task.status === nextStatus)
    .map((task, index) => ({
      ...task,
      position: getPositionValue(task, index),
    }))

  const activeTaskWithStatus = {
    ...activeTask,
    position: getPositionValue(activeTask, nextColumnTasks.length),
    status: nextStatus,
  }
  const overIndex = nextColumnTasks.findIndex((task) => task._id === overId)

  if (overIndex === -1) {
    nextColumnTasks.push(activeTaskWithStatus)
  } else {
    nextColumnTasks.splice(overIndex, 0, activeTaskWithStatus)
  }

  const activeIndex = nextColumnTasks.findIndex((task) => task._id === activeId)
  const previousTask = nextColumnTasks[activeIndex - 1]
  const nextTask = nextColumnTasks[activeIndex + 1]

  if (!previousTask && !nextTask) {
    return Date.now()
  }

  if (!previousTask) {
    return nextTask.position - 1000
  }

  if (!nextTask) {
    return previousTask.position + 1000
  }

  return (previousTask.position + nextTask.position) / 2
}

function getPositionValue(task, index) {
  return Number.isFinite(task.position) ? task.position : (index + 1) * 1000
}
