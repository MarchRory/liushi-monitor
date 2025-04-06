import BasePerformancePlugins from './performance/index'
import BaseUserBehaviorPlugins from './userBehavior'
import BaseErrorMonitorPlugins from './commonErrorTrap/indesx'
import BaseNetWorkPlugins from './network'

const SDKBasePlugins = [
    ...BasePerformancePlugins,
    ...BaseUserBehaviorPlugins,
    ...BaseErrorMonitorPlugins,
    ...BaseNetWorkPlugins
]

export default SDKBasePlugins