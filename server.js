const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'records.json');

app.use(express.json());
app.use(express.static(__dirname));

function load() { try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch (e) { return []; } }
function save(d) { fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2)); }

// ---- 企业裁员数据（模拟） ----
const LAYOFFS = [
  { id: 'l1', company: '腾讯', date: '2026-11', scale: '15%+', department: '全公司', reason: '组织变革', status: '传言', source: '社交媒体' },
  { id: 'l2', company: '字节跳动', date: '2026-10', scale: '10%', department: '教育业务', reason: '业务调整', status: '确认', source: '媒体报道' },
  { id: 'l3', company: '阿里', date: '2026-09', scale: '5-8%', department: '云业务', reason: '成本优化', status: '确认', source: '媒体报道' },
  { id: 'l4', company: '美团', date: '2026-08', scale: '8%', department: '优选业务', reason: '业务收缩', status: '确认', source: '媒体报道' },
  { id: 'l5', company: '百度', date: '2026-07', scale: '6%', department: '移动生态', reason: 'AI 转型', status: '确认', source: '媒体报道' },
  { id: 'l6', company: '京东', date: '2026-06', scale: '4%', department: '物流', reason: '自动化替代', status: '传言', source: '社交媒体' },
  { id: 'l7', company: '快手', date: '2026-05', scale: '12%', department: '国际化', reason: '战略收缩', status: '确认', source: '媒体报道' },
  { id: 'l8', company: '滴滴', date: '2026-04', scale: '15%', department: '出行业务', reason: '监管影响', status: '确认', source: '媒体报道' }
];

// ---- 员工权益知识库 ----
const KNOWLEDGE = [
  { id: 'severance', title: '经济补偿金计算（N+1）', tags: ['补偿', 'N+1', '法律'],
    content: 'N = 工作年限（满6个月计1年，不满6个月计0.5年）。补偿金 = N × 月平均工资。月平均工资 = 前12个月工资总额/12。上限：当地社平工资3倍，年限最高12年。' },
  { id: 'notice', title: '裁员通知程序', tags: ['通知', '程序', '30天'],
    content: '企业裁员需提前30天向工会/职工代表说明情况，听取意见。需向劳动行政部门报告。未提前通知的，可能构成违法解除。' },
  { id: 'priority', title: '裁员优先留用人员', tags: ['优先', '留用', '保护'],
    content: '以下人员在同等条件下优先留用：1) 与本单位订立较长期限劳动合同；2) 有扶养/赡养义务；3) 残疾/工伤人员；4) 家庭无其他就业人员。' },
  { id: 'prohibited', title: '禁止裁员情形', tags: ['禁止', '保护', '特殊'],
    content: '以下情形不得裁员：1) 职业病/工伤未愈；2) 孕期/产期/哺乳期；3) 连续工作15年且距退休不足5年；4) 医疗期未满。' },
  { id: 'dispute', title: '劳动争议处理', tags: ['争议', '仲裁', '诉讼'],
    content: '被违法裁员可：1) 向劳动仲裁委员会申请仲裁；2) 仲裁不服可诉讼；3) 申请劳动监察；4) 协商调解。时效：仲裁时效1年。' },
  { id: 'unemployment', title: '失业保险与再就业', tags: ['失业', '保险', '再就业'],
    content: '被裁员可领取失业金（需缴满1年）。再就业服务：职业介绍、培训、创业扶持。部分城市提供技能提升补贴。' },
  { id: 'noncompete', title: '竞业限制补偿', tags: ['竞业', '补偿', '限制'],
    content: '竞业限制期限最长2年，补偿金每月不低于离职前12个月平均工资的30%。企业未支付补偿，竞业限制失效。' },
  { id: 'social', title: '社保与公积金处理', tags: ['社保', '公积金', '转移'],
    content: '离职后社保可：1) 转移接续；2) 个人缴纳；3) 断缴影响医疗/购房。公积金可提取或转移。' }
];

// ---- 求职市场数据 ----
const JOBS = [
  { id: 'j1', title: '高级前端工程师', company: '某AI创业公司', salary: '30-50K', location: '北京/远程', tags: ['React', 'Node.js'] },
  { id: 'j2', title: '产品经理', company: '某互联网公司', salary: '25-40K', location: '上海', tags: ['B端', 'AI'] },
  { id: 'j3', title: '数据分析师', company: '某金融科技', salary: '20-35K', location: '深圳', tags: ['Python', 'SQL'] },
  { id: 'j4', title: '运营经理', company: '某电商公司', salary: '18-30K', location: '杭州', tags: ['增长', '用户'] },
  { id: 'j5', title: '后端工程师', company: '某云服务', salary: '35-55K', location: '北京', tags: ['Go', 'K8s'] }
];

// ---- API ----
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.get('/api/layoffs', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const company = req.query.company;
  let list = LAYOFFS;
  if (company) list = list.filter(l => l.company.includes(company));
  if (q) list = list.filter(l => l.company.toLowerCase().includes(q) || l.department.toLowerCase().includes(q) || l.reason.toLowerCase().includes(q));
  res.json(list);
});

app.get('/api/knowledge', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const tag = req.query.tag;
  let list = KNOWLEDGE;
  if (tag) list = list.filter(k => k.tags.includes(tag));
  if (q) list = list.filter(k => k.title.toLowerCase().includes(q) || k.content.toLowerCase().includes(q) || k.tags.some(t => t.toLowerCase().includes(q)));
  res.json(list);
});

app.get('/api/knowledge/tags', (req, res) => res.json([...new Set(KNOWLEDGE.flatMap(k => k.tags))]));

app.get('/api/jobs', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  let list = JOBS;
  if (q) list = list.filter(j => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.tags.some(t => t.toLowerCase().includes(q)));
  res.json(list);
});

// 补偿金计算器
app.post('/api/calc', (req, res) => {
  const { years = 0, months = 0, monthlySalary = 0, localAvg = 10000, cap = true } = req.body || {};
  const n = years + (months >= 6 ? 1 : (months > 0 ? 0.5 : 0));
  const cappedSalary = cap ? Math.min(monthlySalary, localAvg * 3) : monthlySalary;
  const cappedYears = cap ? Math.min(n, 12) : n;
  const compensation = cappedYears * cappedSalary;
  res.json({
    n: cappedYears,
    monthlySalary: cappedSalary,
    compensation: Math.round(compensation),
    note: cap ? '已按当地社平工资3倍和12年上限计算' : '未应用上限'
  });
});

// 记录管理
app.post('/api/records', (req, res) => {
  const { company = '', department = '', date = '', status = '', notes = '' } = req.body || {};
  const r = { id: crypto.randomUUID(), ts: new Date().toISOString(), company, department, date, status, notes };
  const all = load(); all.unshift(r); save(all.slice(0, 200));
  res.json(r);
});

app.get('/api/records', (req, res) => res.json(load()));
app.get('/api/records/:id', (req, res) => { const r = load().find(x => x.id === req.params.id); if (!r) return res.status(404).json({ error: 'not found' }); res.json(r); });
app.delete('/api/records/:id', (req, res) => { const all = load().filter(x => x.id !== req.params.id); save(all); res.json({ ok: true }); });

app.listen(PORT, () => console.log(`Layoff Monitor running on http://localhost:${PORT}`));