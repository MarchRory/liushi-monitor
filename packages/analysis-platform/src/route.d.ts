import { NonIndexRouteObject, IndexRouteObject } from 'react-router-dom'

declare module 'react-router-dom' {
    interface MenuItem {
        public?: boolean
        auth?: IUserTypeEnum,
        label: string,
        title: string,
        key: string,
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