import type { HazardRecord } from './yinghuanLibrary';

/** 前 N 条在解析顺序上生成与 Excel 字段强关联的详细处置建议 */
export const DISPOSAL_ADVICE_COVERED_COUNT = 300;

function clip(s: string, max: number): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function classifyFocus(content: string): string {
  if (!content) return '按表格「排查内容」所列要点逐条核查并形成整改清单。';
  if (/制度|文件|下发|流程/.test(content)) {
    return '优先核查制度是否成文、是否下发至相关岗位，补全缺失条款并留存签发与培训记录。';
  }
  if (/培训|教育|交底|持证/.test(content)) {
    return '落实分级培训与安全技术交底，抽查考核与持证上岗情况，不合格人员不得独立作业。';
  }
  if (/设备|机械|防护|检修|维保/.test(content)) {
    return '对设备本体、安全防护装置及维保记录开展专项检查，缺陷未消除前采取停机或限用措施。';
  }
  if (/消防|动火|易燃|用电|临电/.test(content)) {
    return '按消防与临时用电管理规定复查设施配置、审批票证与现场监护，消除违章用电与火源管理漏洞。';
  }
  if (/基坑|隧道|支护|降水|监测/.test(content)) {
    return '复核支护、降水与监测方案执行情况，加密关键断面监测，异常立即预警并启动应急预案。';
  }
  if (/起重|吊装|索具/.test(content)) {
    return '核查起重设备检验、索具选型与作业票，严禁超载与违规站位，必要时重新计算吊点与工况。';
  }
  if (/环保|扬尘|噪声|废水|固废/.test(content)) {
    return '对照环保措施落实抑尘、降噪与废弃物分类处置，完善台账与第三方检测资料。';
  }
  if (/质量|试验|检测|材料|验收/.test(content)) {
    return '追溯材料进场、复试与工序验收记录，对不合格项执行退场或返工，并复检闭环。';
  }
  return '围绕排查内容中的管理或技术要点，制定可验证的整改措施与完成标准。';
}

function levelDirective(level: string): string {
  const t = level.replace(/\s/g, '');
  if (/[ⅠI1一]/.test(t) && t.length <= 4) {
    return '本条为最高关注级别：须由项目负责人立即组织现场处置，必要时停工整顿，并向主管单位报告进展。';
  }
  if (/[ⅡI2二]/.test(t) && t.length <= 4) {
    return '按较大风险管控：指定专人督办，限期完成整改与复查，未闭环不得转入下道工序。';
  }
  if (/[ⅢI3三]/.test(t) && t.length <= 4) {
    return '纳入日常巡查与周例会跟踪，整改完成后由班组自检、项目部抽检确认。';
  }
  return '结合企业分级管控要求确定责任层级与检查频次，确保责任到人、时限清晰。';
}

function timelineClause(h: HazardRecord): string {
  if (h.rectifyDays && /^\d+(\.\d+)?$/.test(h.rectifyDays.trim())) {
    return `Excel 给定整改期限为 ${h.rectifyDays} 天：建议第 1 日完成风险隔离与方案确认，中期完成整改实施，末期前完成复查与资料归档；超期须书面说明并升级审批。`;
  }
  if (h.rectifyDays) {
    return `整改期限字段为「${h.rectifyDays}」：请按企业制度将其换算为可执行日历计划，并设置提醒与逾期预警。`;
  }
  return '表格未填明天数时，由项目部依据隐患级别在制度框架内明确起止日期，并同步监理（如有）确认。';
}

function orgClause(h: HazardRecord, variant: number): string {
  const path = [h.category, h.subcategory].filter(Boolean).join(' / ') || '本专业';
  const phrases = [
    `由 ${path} 条线对口负责人组织联合检查，明确总包、分包及监理（若适用）的职责界面。`,
    `将本条纳入 ${h.sheetName} 专项检查单，实行“谁检查、谁签字、谁负责”的闭环责任制。`,
    `对涉及多工种交叉的隐患，指定单一协调人统筹停复工条件与作业许可衔接。`,
  ];
  return phrases[variant % phrases.length];
}

/** 前 300 条（按解析顺序）：返回 5～6 条与表格字段结合的处置建议；其余条目返回简短通用建议 */
export function getDisposalAdviceBullets(h: HazardRecord): string[] {
  if (h.sourceOrderIndex >= DISPOSAL_ADVICE_COVERED_COUNT) {
    return [
      clip(
        `结合「${h.sheetName}」与排查内容：${clip(h.checkContent, 120) || '（见详情全文）'}`,
        200,
      ),
      '组织对照自查，留存检查表、影像及会议纪要；按整改期限或企业制度完成闭环与复核记录。',
      '若排查内容涉及标准条文，请核对现行有效版本及适用条款，必要时咨询企业技术或法务。',
    ];
  }

  const v = h.sourceOrderIndex % 5;
  const pathFull = [h.category, h.subcategory, h.fineCategory].filter(Boolean).join(' → ') || '（未分层）';
  const focus = clip(h.checkContent, 200);

  const bullets: string[] = [
    `【工程板块 · ${h.sheetName}】分类路径：${pathFull}。排查焦点摘要：${focus || '（本条无正文，请据编号与分类补全现场核对项）'}`,
    orgClause(h, v),
    levelDirective(h.level),
    classifyFocus(h.checkContent),
    timelineClause(h),
  ];

  bullets.push(
    `建立本条（编号 ${h.code || '—'}）的整改台账：措施、责任人、完成时间、复查结论四要素齐全；必要时开展同类隐患横向排查，防止重复发生。`,
  );

  return bullets;
}
