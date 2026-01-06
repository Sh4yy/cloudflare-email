#!/bin/bash

echo "Please enter the domain name:"
read DOMAIN

echo "Please enter your worker subdomain:"
echo "(only the subdomain, for example admin.workers.dev than admin)"
read WORKER_SUBDOMAIN

echo "Please enter the DKIM selector:"
read DKIM_SELECTOR

echo
echo "Generate RSA 2048 private key"
PRIVATE_KEY=$(openssl genrsa 2048)

echo "Generate public key in base64 format"
PUBLIC_KEY_BASE64=$(openssl rsa -pubout -outform der <<< "$PRIVATE_KEY" | openssl base64 -A)

echo "Convert private key to base64"
DKIM_PRIVATE_KEY=$(openssl rsa -outform der <<< "$PRIVATE_KEY"| openssl base64 -A)

echo "Generate DKIM public key"
DKIM_PUBLIC_KEY=$(echo -n "v=DKIM1;p=" && echo $PUBLIC_KEY_BASE64)

echo "Getting SPF record for $DOMAIN"
CURRENT_SPF_RECORD=$(dig +short $DOMAIN TXT | grep spf1)
if [ -z "$CURRENT_SPF_RECORD" ]
then
  SPF_RECORD="@ IN TXT v=spf1 a mx include:relay.mailchannels.net ~all"
else
  echo "Current SPF record found: $CURRENT_SPF_RECORD"
  SPF_RECORD="@ IN TXT $(echo $CURRENT_SPF_RECORD | sed 's/\(.*\)\(-all\|~all\|+all\|?all\)/\1 include:relay.mailchannels.net \2/')"
fi
echo 
echo 

echo "Add the following TXT record to your DNS zone:"
echo $SPF_RECORD
echo "_mailchannels IN TXT v=mc1 cfid=$WORKER_SUBDOMAIN.workers.dev cfid=$DOMAIN"
echo "$DKIM_SELECTOR._domainkey.$DOMAIN IN TXT $DKIM_PUBLIC_KEY"
echo
echo
echo "Add the following environment variables to your worker enviroment variables (wrangler secret put <KEY> and than VALUE):"
echo "TOKEN=$(openssl rand -base64 36)"
echo "DKIM_PRIVATE_KEY=$DKIM_PRIVATE_KEY"
echo "DKIM_SELECTOR=$DKIM_SELECTOR"
echo "DKIM_DOMAIN=$DOMAIN"