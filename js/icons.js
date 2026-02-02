// Icon component wrapper
const Icon = ({ d, ...props }) => (
  React.createElement('svg', {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...props
  }, Array.isArray(d) ? d.map((path, i) => 
    React.createElement('path', { key: i, d: path })
  ) : React.createElement('path', { d }))
);

// Icon components
const Wallet = () => Icon({ d: ["M21 12V7H5a2 2 0 0 1 0-4h14v4", "M3 5v14a2 2 0 0 0 2 2h16v-5", "M18 12a2 2 0 0 0 0 4h4v-4Z"] });

const TrendingUp = () => Icon({ d: "m22 7-8.5 8.5-5-5L2 17" });

const TrendingDown = () => Icon({ d: "m22 17-8.5-8.5-5 5L2 7" });

const Plus = () => Icon({ d: ["M12 5v14", "M5 12h14"] });

const X = () => Icon({ d: ["M18 6 6 18", "m6 6 12-12"] });

const Target = () => React.createElement('svg', {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, [
  React.createElement('circle', { key: 1, cx: "12", cy: "12", r: "10" }),
  React.createElement('circle', { key: 2, cx: "12", cy: "12", r: "6" }),
  React.createElement('circle', { key: 3, cx: "12", cy: "12", r: "2" })
]);

const PiggyBank = () => Icon({ d: "M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" });

const Users = () => Icon({ d: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M22 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"] });

const ShoppingCart = () => React.createElement('svg', {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, [
  React.createElement('circle', { key: 1, cx: "8", cy: "21", r: "1" }),
  React.createElement('circle', { key: 2, cx: "19", cy: "21", r: "1" }),
  React.createElement('path', { key: 3, d: "M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" })
]);

const Home = () => Icon({ d: ["m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"] });

const Car = () => Icon({ d: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" });

const Utensils = () => Icon({ d: ["M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2", "M7 2v20", "M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"] });

const Film = () => React.createElement('svg', {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, [
  React.createElement('rect', { key: 1, width: "20", height: "20", x: "2", y: "2", rx: "2.18", ry: "2.18" }),
  React.createElement('line', { key: 2, x1: "7", x2: "7", y1: "2", y2: "22" }),
  React.createElement('line', { key: 3, x1: "17", x2: "17", y1: "2", y2: "22" }),
  React.createElement('line', { key: 4, x1: "2", x2: "22", y1: "12", y2: "12" }),
  React.createElement('line', { key: 5, x1: "2", x2: "7", y1: "7", y2: "7" }),
  React.createElement('line', { key: 6, x1: "2", x2: "7", y1: "17", y2: "17" }),
  React.createElement('line', { key: 7, x1: "17", x2: "22", y1: "17", y2: "17" }),
  React.createElement('line', { key: 8, x1: "17", x2: "22", y1: "7", y2: "7" })
]);

const Heart = () => Icon({ d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" });

const Zap = () => React.createElement('svg', {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement('polygon', { points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2" }));

const CreditCard = () => React.createElement('svg', {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, [
  React.createElement('rect', { key: 1, width: "22", height: "16", x: "1", y: "4", rx: "2", ry: "2" }),
  React.createElement('line', { key: 2, x1: "1", x2: "23", y1: "10", y2: "10" })
]);

const BarChart3 = () => Icon({ d: ["M3 3v18h18", "M18 17V9", "M13 17V5", "M8 17v-3"] });

// Export icons
window.Icons = {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  Target,
  PiggyBank,
  Users,
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Film,
  Heart,
  Zap,
  CreditCard,
  BarChart3
};
