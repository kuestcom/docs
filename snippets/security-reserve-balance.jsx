const SECURITY_RESERVE_ADDRESS = '0x089517438121eA31BAf3666554d812ca0b36c6c5'
const BALANCE_OF_CALL = `0x70a08231000000000000000000000000${SECURITY_RESERVE_ADDRESS.slice(2).toLowerCase()}`
const USDC_SCALE = 1_000_000n

const SECURITY_RESERVE_NETWORKS = {
  polygon: {
    label: 'Polygon mainnet',
    rpcUrl: 'https://polygon-bor-rpc.publicnode.com',
    usdc: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  },
  amoy: {
    label: 'Polygon Amoy',
    rpcUrl: 'https://polygon-amoy.gateway.tenderly.co',
    usdc: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
  },
}

const formatUsdcBalance = (rawBalance) => {
  const whole = rawBalance / USDC_SCALE
  const fraction = (rawBalance % USDC_SCALE).toString().padStart(6, '0')
  const exact = `${whole}.${fraction}`
  const formattedWhole = new Intl.NumberFormat('en-US').format(whole)

  return {
    exact,
    formatted: `${formattedWhole}.${fraction.slice(0, 2)}`,
  }
}

export const SecurityReserveBalance = ({ network = 'polygon' }) => {
  const config = SECURITY_RESERVE_NETWORKS[network] ?? SECURITY_RESERVE_NETWORKS.polygon
  const [balance, setBalance] = useState(null)
  const [failed, setFailed] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true

    const loadBalance = async () => {
      try {
        const response = await fetch(config.rpcUrl, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_call',
            params: [{ to: config.usdc, data: BALANCE_OF_CALL }, 'latest'],
          }),
        })
        const payload = await response.json()
        if (!response.ok || typeof payload.result !== 'string') throw new Error('RPC request failed')
        if (active) {
          setBalance(BigInt(payload.result))
          setFailed(false)
        }
      } catch {
        if (active) setFailed(true)
      }
    }

    loadBalance()
    const interval = window.setInterval(loadBalance, 60_000)

    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [config.rpcUrl, config.usdc, refreshKey])

  const displayBalance = balance === null ? null : formatUsdcBalance(balance)

  return (
    <div className="not-prose my-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="m-0 text-sm font-medium text-gray-950 dark:text-white">Security Reserve balance</p>
          <p className="m-0 mt-1 text-xs text-gray-500">Read directly from {config.label} by RPC</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
          <span
            className={`h-1.5 w-1.5 rounded-full ${failed ? 'bg-amber-500' : 'bg-emerald-500'}`}
            aria-hidden="true"
          />
          {failed ? (balance === null ? 'Unavailable' : 'Last read') : 'Live'}
        </span>
      </div>
      <p
        className="m-0 mt-3 font-mono text-2xl font-semibold text-gray-950 dark:text-white"
        title={displayBalance ? `${displayBalance.exact} USDC` : undefined}
      >
        {displayBalance ? `${displayBalance.formatted} USDC` : failed ? 'Unavailable' : 'Loading…'}
      </p>
      {failed && (
        <button
          className="mt-2 cursor-pointer border-0 bg-transparent p-0 text-xs font-medium text-lime-700 hover:underline dark:text-lime-300"
          type="button"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          Try again
        </button>
      )}
    </div>
  )
}
