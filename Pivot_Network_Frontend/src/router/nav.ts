export interface NavItem {
  to: string
  label: string
  kicker: string
  desc: string
}

export const navItems: NavItem[] = [
  { to: '/', label: '首页', kicker: 'Homepage', desc: '产品发布会首页' },
  { to: '/overview', label: '平台总览', kicker: 'Overview', desc: '平台运行态势与关键指标' },
  { to: '/marketplace', label: '资源市场', kicker: 'Marketplace', desc: '浏览可售算力资源并下单' },
  { to: '/algorithms', label: '算法工坊', kicker: 'Algorithms', desc: '选择开箱即用的运行模板' },
  { to: '/monitor', label: '监控中心', kicker: 'Monitor', desc: '节点健康、负载与资源趋势' },
  { to: '/seller', label: '卖家控制台', kicker: 'Seller Console', desc: '接入节点、上架资源、管理报价' },
  { to: '/session', label: '会话中心', kicker: 'Session Center', desc: '运行会话、任务与工作区' },
]
