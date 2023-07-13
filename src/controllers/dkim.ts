
type DkimInfo = {dkim_domain: string ; dkim_selector: string ; dkim_private_key: string };

class Dkim {
    public static getInfo(email: string, env: Env) : DkimInfo {
        let dkimInfo: DkimInfo = {dkim_domain: env.DKIM_DOMAIN ?? "", dkim_selector: env.DKIM_SELECTOR ?? "", dkim_private_key: env.DKIM_PRIVATE_KEY ?? ""};

        if (!env.DKIM) {
            return dkimInfo;
        }
        for (let domain in env.DKIM) {
            if (email.endsWith(domain)) {
                dkimInfo = env.DKIM[domain];
                break;
            }
        }
        return dkimInfo;
    }
}

export default Dkim;