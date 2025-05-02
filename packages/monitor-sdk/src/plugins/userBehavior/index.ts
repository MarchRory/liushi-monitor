import DefaultClickPlugin from "./src/defaultClickPlugin";
import CompClickPlugin from './src/compClickPlugin'
import PvPlugin from "./src/pvPlugin";
import UvPlugin from "./src/uvPlugin";

const BaseUserBehaviorPlugins = [
    PvPlugin,
    UvPlugin,
    DefaultClickPlugin,
    CompClickPlugin
]
export default BaseUserBehaviorPlugins