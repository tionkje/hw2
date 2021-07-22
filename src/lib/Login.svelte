<script lang="ts">
  import { session } from '$app/stores';
  let errorMsg;
  async function submit(e) {
    errorMsg = '';
    const login = e.target.login.value;
    const password = e.target.password.value;
    const res = await fetch(`/api/login?login=${login}&password=${password}`);
    if (res.ok) $session.loggedin = true;
    else errorMsg = res.statusText;
  }
  async function logout() {
    $session.loggedin = false;
  }
</script>

{#if $session.loggedin}
  <button on:click={logout}>logout</button>
{:else}
  <form on:submit|preventDefault={submit}>
    <div>
      <input value="a" name="login" placeholder="login" required />
    </div>
    <div>
      <input value="a" name="password" type="password" placeholder="password" required />
    </div>
    <button>login</button>
    {#if errorMsg}
      <span style="color:red">{errorMsg}</span>
    {/if}
  </form>
{/if}
