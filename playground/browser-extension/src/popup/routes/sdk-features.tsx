export const SDKFeatures = () => {
  return (
    <>
      <p>Background Worker</p>
      <button
        onClick={() => {
          chrome.tabs.create({
            url: "./tabs/background-worker-demo.html"
          })
        }}>
        open tab page
      </button>

    </>
  )
}
