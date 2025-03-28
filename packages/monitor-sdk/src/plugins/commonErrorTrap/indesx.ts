import JavaScriptErrorPlugin from "./src/JavaScriptErrorPlugin";
import SourceErrorPlugin from "./src/sourceErrorPlugin";
import UnCatchPromiseErrorPlugin from "./src/uncatchPromiseErrorPlugin";


const BaseErrorMonitorPlugins = [
    JavaScriptErrorPlugin,
    UnCatchPromiseErrorPlugin,
    SourceErrorPlugin
]

export default BaseErrorMonitorPlugins