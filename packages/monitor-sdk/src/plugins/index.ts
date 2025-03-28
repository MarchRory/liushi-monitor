import BasePerformancePlugins from './performance/index'
import BaseUserBehaviorPlugins from './userBehavior'
import BaseErrorMonitorPlugins from './commonErrorTrap/indesx'

const SDKBasePlugins = [
    ...BasePerformancePlugins,
    ...BaseUserBehaviorPlugins,
    ...BaseErrorMonitorPlugins
]

export default SDKBasePlugins