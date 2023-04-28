import React, { useContext, useEffect, useState } from "react";
import type { NextPage } from "next";
import styles from "../styles/profile.module.css";
import { useRouter } from "next/router";
import { isHexString } from "../utils/stringService";
import { useAccount } from "@starknet-react/core";
import SocialMediaActions from "../components/UI/actions/socialmediaActions";
import { StarknetIdJsContext } from "../context/StarknetIdJsProvider";
import CopiedIcon from "../components/UI/iconsComponents/icons/copiedIcon";
import { Divider, Tooltip } from "@mui/material";
import { ContentCopy } from "@mui/icons-material";
import { decimalToHex, hexToDecimal } from "../utils/feltService";
import StarknetIcon from "../components/UI/iconsComponents/icons/starknetIcon";
import NftCard from "../components/UI/nftCard";
import { minifyAddress } from "../utils/stringService";

const AddressOrDomain: NextPage = () => {
  const router = useRouter();
  const { addressOrDomain } = router.query;
  const { address } = useAccount();
  const { starknetIdNavigator } = useContext(StarknetIdJsContext);
  const [initProfile, setInitProfile] = useState(false);
  const [identity, setIdentity] = useState<Identity>();
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [active, setActive] = useState(0);

  const dynamicRoute = useRouter().asPath;
  useEffect(() => setNotFound(false), [dynamicRoute]);

  useEffect(() => {
    setInitProfile(false);
  }, [router]);

  useEffect(() => {
    if (!address) setIsOwner(false);
  }, [address]);

  useEffect(() => {
    if (
      typeof addressOrDomain === "string" &&
      addressOrDomain?.toString().toLowerCase().endsWith(".stark")
    ) {
      starknetIdNavigator
        ?.getStarknetId(addressOrDomain)
        .then((id) => {
          getIdentityData(id).then((data: Identity) => {
            if (data.error) return;
            setIdentity({
              ...data,
              id: id.toString(),
            });
            if (hexToDecimal(address) === data.addr) setIsOwner(true);
            setInitProfile(true);
          });
        })
        .catch(() => {
          return;
        });
    } else if (
      typeof addressOrDomain === "string" &&
      isHexString(addressOrDomain as string)
    ) {
      starknetIdNavigator
        ?.getStarkName(addressOrDomain)
        .then((name) => {
          console.log("name", name);
          if (name) {
            starknetIdNavigator?.getStarknetId(name).then((id) => {
              getIdentityData(id).then((data: Identity) => {
                if (data.error) return;
                setIdentity({
                  ...data,
                  id: id.toString(),
                });
                if (hexToDecimal(address) === data.addr) setIsOwner(true);
                setInitProfile(true);
              });
            });
          }
        })
        .catch(() => {
          setNotFound(true);
          return;
        });
    } else {
      setNotFound(true);
    }
  }, [addressOrDomain, address]);

  const getIdentityData = async (id: number) => {
    const response = await fetch(
      `https://app.starknet.id/api/indexer/id_to_data?id=${id}`
    );
    return response.json();
  };

  const copyToClipboard = () => {
    setCopied(true);
    navigator.clipboard.writeText(decimalToHex(identity?.addr));
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  if (notFound) {
    return (
      <div
        className={`h-screen flex justify-center items-center ${styles.name}`}
      >
        <h2 className={styles.notFound}>Profile not found</h2>
      </div>
    );
  }

  return initProfile && identity ? (
    <>
      <div className={styles.screen}>
        <div className={styles.profileContainer}>
          <div className={styles.profilePictureContainer}>
            <div className={styles.profilePicture}>
              <img
                width={"350px"}
                src={`https://www.starknet.id/api/identicons/${identity?.id}`}
                alt="starknet.id avatar"
                style={{ maxWidth: "150%" }}
              />
            </div>
            {/* We do not enable the profile pic change atm */}
            {/* <Tooltip title="Change profile picture" arrow>
              <div className={styles.cameraIcon}>
                <CameraAlt
                  className={styles.cameraAlt}
                  onClick={() => console.log("changing pfp")}
                />
              </div>
            </Tooltip> */}
          </div>
          <Divider variant="middle" orientation="vertical" />
          <div className="flex flex-col flex-start gap-3">
            <div className={styles.name}>{identity?.domain}</div>
            <div className={styles.starknetInfo}>
              <StarknetIcon width="32px" color="" />
              <div className={styles.address}>
                {minifyAddress(decimalToHex(identity?.addr))}
              </div>

              <div className="cursor-pointer">
                {!copied ? (
                  <Tooltip title="Copy" arrow>
                    <ContentCopy
                      className={styles.contentCopy}
                      onClick={() => copyToClipboard()}
                    />
                  </Tooltip>
                ) : (
                  <CopiedIcon color="#6affaf" width="25" />
                )}
              </div>
            </div>
            <div className="flex lg:justify-start justify-center lg:items-start items-center">
              <SocialMediaActions
                domain={identity?.domain}
                isOwner={isOwner}
                tokenId={identity?.id as string}
              />
            </div>
          </div>
        </div>
        <div className={styles.contentContainer}>
          <div className={styles.menu}>
            <div className={styles.menuTitle}>
              <p
                className={
                  active === 1 ? `${styles.active}` : `${styles.inactive}`
                }
                onClick={() => setActive(1)}
              >
                My analytics
              </p>
              <p
                className={
                  active === 0 ? `${styles.active}` : `${styles.inactive}`
                }
                onClick={() => setActive(0)}
              >
                My NFT
              </p>
            </div>
            {!active ? (
              <>
                <div className={styles.content}>
                  <NftCard
                    image={"/visuals/Card.png"}
                    title="Un NFT"
                    onClick={() => window.open("#")}
                  />
                  <NftCard
                    image={"/visuals/Card.png"}
                    title="Un NFT"
                    onClick={() => window.open("#")}
                  />
                  <NftCard
                    image={"/visuals/Card.png"}
                    title="Un NFT"
                    onClick={() => window.open("#")}
                  />
                  <NftCard
                    image={"/visuals/Card.png"}
                    title="Un NFT"
                    onClick={() => window.open("#")}
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  ) : (
    <div className={`h-screen flex justify-center items-center ${styles.name}`}>
      <h2>Loading</h2>
    </div>
  );
};

export default AddressOrDomain;
