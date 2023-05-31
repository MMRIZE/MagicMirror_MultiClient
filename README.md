# MagicMirror experimental feature - Multi clients / Layout templatation

## Multi-clients / Multi-screen (clientonly)

- Browser

```
http://MM_HOST_ADDRESS:MM_HOST_PORT/?client=CLIENT_ID&config=CONFIG_ID&layout=LAYOUT_ID
```

- ClientOnly

```sh
node clientonly --address MM_HOST_ADDRESS --port MM_HOST_PORT [--client CLIENT_ID] [--config CONFIG_ID] [--layout LAYOUT_ID] [--display DISPLAY_ID] [--use-tls]
```

- **`client`** : identifier of each instance of clients. not to be unique. If omitted, `default` would be applied. (`default` would be also used on a standalone instance)

- **`config`** : pointer of a configuration file of this instance. MM would try to apply `config/CONFIG_ID.js`, If fails or is omitted, then would try `config/CLIENT_ID.js`. If fails again, the default `config/config.js` would be applied as a fallback. Of course, PROCESS.ENV cannot be used for clients because there could be more than one client be possible on the same device.

- **`layout`** : User-customized region layout. MM would try to load `layout/LAYOUT_ID.html`. If fails or is omitted, then would try `layout/CLIENT_ID.html`. If fails again, the default `layout/default.html` would be applie as a fallback.

- **`display`** : (`clientonly`) You can define WHERE the MM would show on multi-screens of a device. Modern SBCs (e.g. RPI 4B) have more than 1 screen, so when you want to host 2~3 MM screens with one device, you can use it.

## CHANGES

- **ADDED** `layout` directory to contain user-defined layout templates.
- **ADDED** User-defined region is available.
- **CHANGED** `clientonly` runnable on `localhost` (for multiscreens with one device)
- **CHANGED** `Module.sendSocketNotification(notification, payload, client)` to distinguish from which client sends this notification easily.
- **FIXED** `css` non-existence error (It will send fake empty CSS with warning)

## TODO / Open Problem

- Test suites
- Not tested enough, especially Windows and Docker environments.
- Should `nodeHelper` also be able to send notifications to the specific client(s)? - a too-complex structure is needed. While just `payload` might have the recipient client id, it could be achieved without this feature... But somehow unkind.
- Too many modifications from the current MM's architecture. Is it really worthy?
- Again, Is this really useful? (Anyway, I need this feature.)
