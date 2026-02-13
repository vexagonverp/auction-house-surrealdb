import { Layout, Card, Result, Row, Col, Grid, Spin, Button } from "antd";
import { useState, useEffect } from "react";
import { AppHeader } from "./components/AppHeader";
import { ActiveLot } from "./components/ActiveLot";
import { BiddingSection } from "./components/BiddingSection";
import { useAuctionHouse } from "./surreal/hooks";
import "./App.css";

const { Content } = Layout;
const { useBreakpoint } = Grid;

function App() {
  const { identity, connected, items, users, placeBid, generateItem } = useAuctionHouse();
  const screens = useBreakpoint();

  const [submitting, setSubmitting] = useState(false);
  const [percent, setPercent] = useState(0);
  const [isConnectionTimeout, setIsConnectionTimeout] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (connected) {
      setIsConnectionTimeout(false);
      return;
    }
    const timer = setTimeout(() => {
      setIsConnectionTimeout(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [connected]);

  const currentItem = items?.[0];
  const currentUser = identity
    ? users.find((u) => {
        const match = u.identity?.isEqual(identity);
        // console.log(`Checking user ${u.identity?.toString()} against ${identity.toString()}: ${match}`);
        return match;
    })
    : null;

  useEffect(() => {
    console.log("App State Debug:", { 
      connected, 
      identity: identity?.toString(), 
      usersCount: users.length,
      users: users.map(u => ({ id: u.id, identity: u.identity?.toString() })),
      currentUser 
    });
  }, [connected, identity, users, currentUser]);

  const getDeadline = (item: any): number => {
    if (!item?.scheduledAt?.value) return 0;
    const micros =
      item.scheduledAt.value["__timestamp_micros_since_unix_epoch__"] || 0n;
    return Number(micros / 1000n);
  };

  const deadline = currentItem ? getDeadline(currentItem) : 0;
  // If currentBid is null/undefined, fallback to currentPrice. If that is missing, 0.
  const currentPrice =
    currentItem?.currentBid ?? currentItem?.currentPrice ?? 0;
  const isHighestBidder =
    identity &&
    currentItem?.highestBidderId &&
    identity.isEqual(currentItem.highestBidderId);
  const isEnded = deadline > 0 && now > deadline;

    const handleBid = async (amount: number) => {
    if (!currentItem) return;
    setSubmitting(true);
    try {
      await placeBid({
        amount,
        scheduleId: currentItem.scheduledId,
      });
    } catch (error) {
      console.error("Bid failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateItem = async () => {
      try {
          await generateItem();
          // Force a refetch after generation to ensure UI updates even if live query lags
          // In a real app, live query should be enough, but for debugging/robustness:
          // window.location.reload(); // Too aggressive
      } catch (error) {
          console.error("Generate item failed:", error);
      }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <AppHeader
        connected={connected}
        currentUser={currentUser}
        identity={identity}
        screens={screens}
      />

      <Content
        style={{
          padding: screens.xs ? "16px" : "24px",
          maxWidth: 900,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {!connected ? (
          !isConnectionTimeout ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "60vh",
              }}
            >
              <Spin size="large" />
              <div style={{ marginTop: 20 }}>
                Connecting to Auction House...
              </div>
            </div>
          ) : (
            <Result
              status="warning"
              title="Disconnected"
              subTitle="Please refresh your client. Sorry for the inconvenience."
            />
          )
        ) : !currentItem ? (
          <Result
            title="No active auction"
            subTitle="Click below to start a new auction."
            extra={
                <Button type="primary" onClick={handleGenerateItem}>
                    Generate New Item
                </Button>
            }
          />
        ) : (
          <Card
            variant="borderless"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
            styles={{ body: { padding: screens.xs ? "16px" : "32px" } }}
          >
            <Row gutter={[32, 32]}>
              <Col xs={24} md={12}>
                <ActiveLot
                  currentItem={currentItem}
                  currentPrice={currentPrice}
                  isHighestBidder={isHighestBidder}
                />
              </Col>

              <Col
                xs={24}
                md={12}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <BiddingSection
                  isHighestBidder={isHighestBidder}
                  isEnded={isEnded}
                  currentPrice={currentPrice}
                  handleBid={handleBid}
                  submitting={submitting}
                  percent={percent}
                  deadline={deadline}
                  setPercent={setPercent}
                  currentBalance={currentUser?.balance}
                  handleGenerateItem={handleGenerateItem}
                />
              </Col>
            </Row>
             {/* isEnded check moved inside BiddingSection */}
          </Card>
        )}
      </Content>
    </Layout>
  );
}

export default App;
