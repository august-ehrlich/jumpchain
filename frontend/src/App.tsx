import React, { useState } from "react"
import Header from "./layout/Header"
import Footer from "./layout/Footer"
import { Button } from "./components/ui/button"

const App = () => {
  const [count, setCount] = useState(0)

  return (
    <React.Fragment>
        <Header/>
            <div className="p-4">
                <h1>Vite is running in Docker with TypeScript!</h1>
                <p>Count: {count}</p>
                <Button onClick={() => setCount(count + 1)}>Increment</Button>
            </div>
        <Footer/>
    </React.Fragment>
  )
}

export default App