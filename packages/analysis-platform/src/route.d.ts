import { NonIndexRouteObject, IndexRouteObject, To } from 'react-router-dom'

declare module 'react-router-dom' {
    interface MenuItem {
        public?: boolean
        auth?: IUserTypeEnum,
        label: string,
        title: string,
        key: To,
    }
    interface NonIndexRouteObject {
        meta?: MenuItem
        children?: RouteObject[]
    }
    interface IndexRouteObject {
        meta?: MenuItem
        children?: RouteObject[]
    }
}