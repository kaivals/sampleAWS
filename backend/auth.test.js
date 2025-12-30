const login = require("./auth");

test("admin login from DB", async () => {
  const user = await login("kaival@gmail.com", "123456");
  expect(user.role).toBe("admin");
});

test("invalid user login", async () => {
  const user = await login("fake@gmail.com", "0000");
  expect(user).toBe(null);
});
