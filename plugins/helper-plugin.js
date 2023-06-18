export default ({ app }, inject) => {
  // Inject $authorize(msg) in Vue, context and store.
  inject("authorize", (role = []) => {
    console.log(`Hello ${role}!`);
    console.log(app.store.state.userInfo);
  });
};
