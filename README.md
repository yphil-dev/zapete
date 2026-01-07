# Zapete

Remote control for any computer in your local network.

[![Zapete](https://mobilohm.gitlab.io/img/shots/zapete.png)](https://gitlab.com/yphil/zapete)

Zapete is part of the [Mobilohm suite](https://mobilohm.gitlab.io/) of libre mobile apps.

## Installation

### System Dependencies

Zapete requires `xdotool` for keyboard and mouse control:

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install xdotool
```

**Fedora/RHEL/CentOS:**
```bash
sudo dnf install xdotool
# or for older systems:
sudo yum install xdotool
```

**Arch Linux:**
```bash
sudo pacman -S xdotool
```

**macOS (with Homebrew):**
```bash
brew install xdotool
```

### Install and Run Zapete

```bash
git clone https://gitlab.com/yphil/zapete.git
cd zapete
npm install
npm start
```

## Usage

Scan the QRcode or point any browser to the displayed address, and tap "connect". Create buttons to send commands, run scripts, use your imagination.

- At startup, Zapete opens in your desktop's browser ; You can use this instance to edit uyour buttons, they will update/refresh on the phone.
- Your buttons are saved to `~/.config/zapete/buttons.json` so you can sync / version control the file.
- Select "No icon" to display the name of the button instead
- **Touchpad**: Use the touchpad area for mouse control - tap to click, drag to move the cursor

## Development
### Update the icons

- Drop `css/fontello-config.json` in https://fontello.com/ ;
- Edit ;
- Download to your `~/Downloads` dir ;
- `mv -v ~/Downloads/fontello-*.zip ./fontello.zip && rm -rfv fontello-* ; unzip fontello.zip && cp -fv fontello-*/config.json css/fontello-config.json && cp -fv fontello-*/css/*.css css/ && cp -fv fontello-*/font/* font/ && mkdir -p ~/.local/share/fonts/ && cp -fv fontello-*/font/*.ttf ~/.local/share/fonts/ && fc-cache -f -v && rm -rfv fontello-*`.

## Contribute

If you find one of the [MobilOhm](https://mobilohm.gitlab.io/) apps helpful and would like to support its development, consider making a contribution through [Ko-fi](https://ko-fi.com/yphil) or [Liberapay](https://liberapay.com/yPhil/).

Your support helps keep this app free, open source, and ad-free.
