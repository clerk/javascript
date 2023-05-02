import { createSession } from '@clerk/clerk-solid';
import { Component, createEffect } from 'solid-js';
import styles from './App.module.css';

const App: Component = () => {
  const session = createSession();
  createEffect(() => console.log(session()));
  return (
    <div class={styles.App}>
      <h1>solid</h1>
      <pre class={styles.pre}>{JSON.stringify(session(), null, 2)}</pre>
    </div>
  );
};

export default App;
