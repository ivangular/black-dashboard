# exome-dashboard

## development
This work is based on a template distributed by 
[Creative Tim](https://www.creative-tim.com/bootstrap-themes/free). 
Hugely helpful was [WebStorm](https://www.jetbrains.com/webstorm/) IDE. If you are
an academic user, ask them for a teacher/student license. I am a fan.

## the key files

[case description](/src/app/pages/cases)

[dashboard proper](/src/app/pages/cases)

[sidebar](/src/app/components/sidebar)

[styling](/src/assets/scss/black-dashboard)

## deployment

From the shell:

```
ng build --prod
```

Then copy the whole dist folder to the production server, typically in /var/www/html,
say /var/www/html/exome-dashboard/current.

```
chown -R www-data:www-data exome-dashboard
mkdir /var/log/apache2/exome-dashboard
chown -R www-data:www-data  /var/log/apache2/exome-dashboard
```


(using sudo as appropriate)


Add DNS record for subdomain on Cloudflare (if you are using Cloudflare). 
Remember in that case that there is also  certbot-dns-cloudflare for obtaining the
SLL certificate. Check out the instructions 
[here](https://certbot-dns-cloudflare.readthedocs.io/en/stable/). 
Or perhaps even 
[here](https://symplecticgames.wordpress.com/2019/06/16/new-host-checklist/) if you are
starting from scratch. The dns_cloudflare_email is the e-mail you are using to 
communicate with the Cloudflare, not necessarily the e-mail attached to
your server). 

If you are using Apache, the conf file can be found in [tools directory](/tools/exome-dashboard-le-ssl.conf). 
Place the file in /etc/apache/enabled-sites dir. Enable the site:

```
a2ensite exome-dashboard-le-ssl
systemctl reload apache2
```


I am always amazed that these things ever work.
