# Chatterbox, version 1.5.5: (April 1, 2025)
This is WEB application based on Apps from Gurtam (http://apps.wialon.com).

**This is a legacy app: it is no longer developed or maintained. The code is published as is, without support.**

## Description
Chatterbox is a convenient and simple chat, allowing dispatchers to communicate with drivers and send various commands to the unit. Messages can be sent via the Internet or as simple SMS. There is the possibility to send an address using already existing geofences and POIs, or any other address on the map. Besides, you can exchange images, coordinates, share routes, etc.

## License
[The MIT License](LICENSE-MIT)

## Requirements
 * Browser: a current version of Google Chrome, Firefox, Safari or Edge
 * Language: en, br, da, es, fa, fi, he, it, pl, pt, ru, sk
 * Components: SDK
 * URL params: Active SID, Base URL, Host URL, Language, Current user

## Quick start
Apps activation through the management system: https://help.wialon.com/en/wialon-hosting/user-guide/management-system/apps  
Working with applications in the GPS tracking system: https://help.wialon.com/en/wialon-hosting/user-guide/monitoring-system/apps

## Installation
The repository contains the app in the form it is hosted in. Put the files on a web server and open `index.html` with the URL params listed above, for example
`index.html?sid=<Active SID>&baseUrl=https://hst-api.wialon.com&user=<Current user>&lang=en`.

 * On start the page requests `/chatterbox/app/app.json` and the optional `/chatterbox/whitelabel.json` (white label settings) by absolute paths, so host the app under the `/chatterbox/` path to have them picked up.
 * jQuery is loaded from `//ajax.googleapis.com`, the WebGIS layer for Leaflet from `//apps.wialon.com/plugins/`.
