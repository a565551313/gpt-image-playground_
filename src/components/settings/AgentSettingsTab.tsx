import {
  DEFAULT_AGENT_MAX_TOOL_ROUNDS,
  type AgentApiConfigMode,
  type ApiProfile,
  type AppSettings,
} from '../../types'
import { normalizeAgentMaxToolRounds } from '../../lib/apiProfiles'
import Select from '../Select'

interface SelectOption {
  label: string
  value: string
}

interface AgentSettingsTabProps {
  draft: AppSettings
  agentMaxToolRoundsInput: string
  agentTextProfileOptions: SelectOption[]
  agentImageProfileOptions: SelectOption[]
  selectedAgentTextProfile: ApiProfile | null
  selectedAgentImageProfile: ApiProfile | null
  agentTextProfileIds: string[]
  agentImageProfileIds: string[]
  setAgentMaxToolRoundsInput: (value: string) => void
  updateAgentApiConfigMode: (mode: AgentApiConfigMode) => void
  commitSettings: (nextDraft: AppSettings) => void
  commitAgentMaxToolRounds: () => void
}

export default function AgentSettingsTab({
  draft,
  agentMaxToolRoundsInput,
  agentTextProfileOptions,
  agentImageProfileOptions,
  agentTextProfileIds,
  agentImageProfileIds,
  setAgentMaxToolRoundsInput,
  updateAgentApiConfigMode,
  commitSettings,
  commitAgentMaxToolRounds,
}: AgentSettingsTabProps) {
  const toggleTextProfileId = (profileId: string) => {
    const current = [...agentTextProfileIds]
    const idx = current.indexOf(profileId)
    if (idx >= 0) {
      if (current.length <= 1) return
      current.splice(idx, 1)
    } else {
      current.push(profileId)
    }
    commitSettings({ ...draft, agentTextProfileIds: current })
  }

  const toggleImageProfileId = (profileId: string) => {
    const current = [...agentImageProfileIds]
    const idx = current.indexOf(profileId)
    if (idx >= 0) {
      if (current.length <= 1) return
      current.splice(idx, 1)
    } else {
      current.push(profileId)
    }
    commitSettings({ ...draft, agentImageProfileIds: current })
  }

  const renderCheckboxList = (
    options: SelectOption[],
    selectedIds: string[],
    onToggle: (id: string) => void,
  ) => {
    if (options.length === 0) {
      return (
        <div className="w-full rounded-xl border border-gray-200/60 bg-white/50 px-3 py-1.5 text-center text-xs text-gray-700 shadow-sm transition-all duration-200 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-200">
          没有可用配置
        </div>
      )
    }
    return (
      <div className="max-h-60 overflow-y-auto rounded-xl border border-gray-200/60 bg-white/50 dark:border-white/[0.08] dark:bg-white/[0.03] custom-scrollbar">
        {options.map((opt, idx) => {
          const checked = selectedIds.includes(opt.value)
          return (
            <div
              key={opt.value}
              className={`flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                checked
                  ? 'bg-blue-50/60 dark:bg-blue-500/10'
                  : 'hover:bg-gray-50/80 dark:hover:bg-white/[0.04]'
              } ${idx > 0 ? 'border-t border-gray-200/40 dark:border-white/[0.06]' : ''}`}
            >
              <button
                type="button"
                onClick={() => onToggle(opt.value)}
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                  checked
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-300 bg-white dark:border-white/15 dark:bg-white/5'
                }`}
              >
                {checked && (
                  <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className={`flex-1 truncate ${checked ? 'text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                {opt.label}
              </span>
              {checked && (
                <span className="shrink-0 text-[10px] text-blue-400 dark:text-blue-500">
                  #{selectedIds.indexOf(opt.value) + 1}
                </span>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="block">
        <div className="mb-1 flex items-center justify-between gap-3">
          <span className="block text-sm text-gray-600 dark:text-gray-300">使用独立的 API 配置</span>
          <div className="w-20 shrink-0">
            <Select
              value={draft.agentApiConfigMode}
              onChange={(value) => updateAgentApiConfigMode(value as AgentApiConfigMode)}
              options={[
                { label: '关闭', value: 'off' },
                { label: '原生', value: 'native' },
                { label: '混合', value: 'hybrid' },
              ]}
              className="w-full px-3 py-1.5 rounded-xl border border-gray-200/60 dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.06] text-xs transition-all duration-200 shadow-sm text-gray-700 dark:text-gray-200 outline-none"
            />
          </div>
        </div>
        <div data-selectable-text className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
          <div>原生：使用原生的 Responses API 配置，由模型调用 <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[10px] dark:bg-white/[0.06]">image_generation</code> 工具生成图片。</div>
          <div>混合：使用非原生的混合 API 配置，由文本模型调用自定义工具，请求图像模型生成图像，解决部分服务商/模型不支持 <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[10px] dark:bg-white/[0.06]">image_generation</code> 工具的问题。</div>
        </div>
      </div>

      {draft.agentApiConfigMode !== 'off' && (
        <>
          <div className="block">
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="block text-sm text-gray-600 dark:text-gray-300">
                文本模型 API 配置
                <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">（多选，按勾选顺序依次为备选）</span>
              </span>
            </div>
            {renderCheckboxList(agentTextProfileOptions, agentTextProfileIds, toggleTextProfileId)}
            <div data-selectable-text className="mt-1.5 text-xs text-gray-500 dark:text-gray-500">
              用于对话和调用工具，仅支持 Responses API 配置。勾选多个后调用失败时按顺序自动切换下一个重试。
            </div>
          </div>

          {draft.agentApiConfigMode === 'hybrid' && (
            <div className="block">
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="block text-sm text-gray-600 dark:text-gray-300">
                  图像模型 API 配置
                  <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">（多选，按勾选顺序依次为备选）</span>
                </span>
              </div>
              {renderCheckboxList(agentImageProfileOptions, agentImageProfileIds, toggleImageProfileId)}
              <div data-selectable-text className="mt-1.5 text-xs text-gray-500 dark:text-gray-500">
                用于生成图像，支持所有类型的 API 配置。勾选多个后调用失败时按顺序自动切换下一个重试。
              </div>
            </div>
          )}
        </>
      )}
      <label className="block">
        <span className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">最大工具调用轮数</span>
        <input
          value={agentMaxToolRoundsInput}
          onChange={(e) => setAgentMaxToolRoundsInput(e.target.value)}
          onBlur={commitAgentMaxToolRounds}
          type="number"
          min={1}
          max={50}
          className="w-full rounded-xl border border-gray-200/70 bg-white/60 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-300 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-200 dark:focus:border-blue-500/50"
        />
        <div data-selectable-text className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-500">
          默认 15。用于限制 Agent 连续调用工具时的最大轮数，防止无限循环。
        </div>
      </label>
      <div className="block">
        <div className="mb-1 flex items-center justify-between gap-3">
          <span className="block text-sm text-gray-600 dark:text-gray-300">网络搜索</span>
          <button
            type="button"
            onClick={() => {
              const agentMaxToolRounds = agentMaxToolRoundsInput.trim() === ''
                ? DEFAULT_AGENT_MAX_TOOL_ROUNDS
                : normalizeAgentMaxToolRounds(agentMaxToolRoundsInput, draft.agentMaxToolRounds)
              setAgentMaxToolRoundsInput(String(agentMaxToolRounds))
              commitSettings({ ...draft, agentMaxToolRounds, agentWebSearch: !draft.agentWebSearch })
            }}
            className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${draft.agentWebSearch ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
            role="switch"
            aria-checked={draft.agentWebSearch}
            aria-label="网络搜索"
          >
            <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${draft.agentWebSearch ? 'translate-x-[14px]' : 'translate-x-[2px]'}`} />
          </button>
        </div>
        <div data-selectable-text className="text-xs text-gray-500 dark:text-gray-500">
          启用 Responses API 的 <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[10px] dark:bg-white/[0.06]">web_search</code> 工具。模型每次调用此工具会产生少量固定价格的额外计费。
        </div>
      </div>
    </div>
  )
}
