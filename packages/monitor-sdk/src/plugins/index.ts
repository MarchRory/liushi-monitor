import BasePerformancePlugins from './performance/index'
import BaseUserBehaviorPlugins from './userBehavior'


// export * from './commonErrorTrap/indesx'
// export * from './screenRecord/index'
// export * from './userBehavior/index'

const SDKBasePlugins = [
    ...BasePerformancePlugins,
    ...BaseUserBehaviorPlugins
]

export default SDKBasePlugins