export interface IHttpOverview {
    totalRequests: number,
    todayRequests: number,
    avgResponseTime: number,
    successRate: number,
    errorRate: number,
    methodDistribution: Array<{ method: string, count: number, percentage: number }>,
    statusCodeDistribution: Array<{ statusCode: number, count: number, percentage: number }>,
    interfaceUsage: Array<{ interfaceUrl: string, count: number, percentage: number }>,
    hourlyDistribution: Array<{ hour: string, count: number }>,
    slowRequests: { count: number, percentage: number }
}