const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  nick: state => state.user.nick,
  name: state => state.user.qq,
  roles: state => state.user.roles,
  role: state => {
    const map = {}
    const roles = state.user.roles || []
    for (const cur of roles) {
      map[cur] = true
    }
    return map
  },
  permission_routes: state => state.permission.routes,
  errorLogs: state => state.errorLog.logs,
  titleTypes: state => state.title.titleTypes
}
export default getters
