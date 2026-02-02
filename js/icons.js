// ================================================
// Icônes - Composants SVG
// ================================================

const Icon = ({ d, ...props }) => React.createElement('svg', {
  xmlns: "http://www.w3.org/2000/svg",
  width: props.size || 24,
  height: props.size || 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  ...props
}, Array.isArray(d) ? d.map((path, i) => React.createElement('path', { key: i, d: path })) : React.createElement('path', { d }));

window.Icons = {
  Wallet: (props) => Icon({ d: ["M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1", "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"], ...props }),
  TrendingUp: (props) => Icon({ d: "m22 7-8.5 8.5-5-5L2 17", ...props }),
  TrendingDown: (props) => Icon({ d: "m22 17-8.5-8.5-5 5L2 7", ...props }),
  Plus: (props) => Icon({ d: ["M12 5v14", "M5 12h14"], ...props }),
  X: (props) => Icon({ d: ["M18 6 6 18", "m6 6 12-12"], ...props }),
  Target: (props) => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: props.size || 24, height: props.size || 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", ...props },
    React.createElement('circle', { cx: "12", cy: "12", r: "10" }),
    React.createElement('circle', { cx: "12", cy: "12", r: "6" }),
    React.createElement('circle', { cx: "12", cy: "12", r: "2" })
  ),
  Users: (props) => Icon({ d: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M22 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"], ...props }),
  ShoppingCart: (props) => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: props.size || 24, height: props.size || 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", ...props },
    React.createElement('circle', { cx: "8", cy: "21", r: "1" }),
    React.createElement('circle', { cx: "19", cy: "21", r: "1" }),
    React.createElement('path', { d: "M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" })
  ),
  Home: (props) => Icon({ d: ["m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"], ...props }),
  Car: (props) => Icon({ d: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2", ...props }),
  Utensils: (props) => Icon({ d: ["M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2", "M7 2v20", "M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"], ...props }),
  Film: (props) => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: props.size || 24, height: props.size || 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", ...props },
    React.createElement('rect', { width: "20", height: "20", x: "2", y: "2", rx: "2.18", ry: "2.18" }),
    React.createElement('line', { x1: "7", x2: "7", y1: "2", y2: "22" }),
    React.createElement('line', { x1: "17", x2: "17", y1: "2", y2: "22" }),
    React.createElement('line', { x1: "2", x2: "22", y1: "12", y2: "12" }),
    React.createElement('line', { x1: "2", x2: "7", y1: "7", y2: "7" }),
    React.createElement('line', { x1: "2", x2: "7", y1: "17", y2: "17" }),
    React.createElement('line', { x1: "17", x2: "22", y1: "17", y2: "17" }),
    React.createElement('line', { x1: "17", x2: "22", y1: "7", y2: "7" })
  ),
  Heart: (props) => Icon({ d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z", ...props }),
  Zap: (props) => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: props.size || 24, height: props.size || 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", ...props },
    React.createElement('polygon', { points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2" })
  ),
  CreditCard: (props) => React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: props.size || 24, height: props.size || 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", ...props },
    React.createElement('rect', { width: "22", height: "16", x: "1", y: "4", rx: "2", ry: "2" }),
    React.createElement('line', { x1: "1", x2: "23", y1: "10", y2: "10" })
  ),
  BarChart3: (props) => Icon({ d: ["M3 3v18h18", "M18 17V9", "M13 17V5", "M8 17v-3"], ...props }),
  Trash: (props) => Icon({ d: ["M3 6h18", "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"], ...props }),
  Edit: (props) => Icon({ d: ["M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"], ...props }),
  Brain: (props) => Icon({ d: "M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08 2.5 2.5 0 0 0 4.91.05L12 20V4.5ZM16 8V5c0-1.1.9-2 2-2", ...props })
};