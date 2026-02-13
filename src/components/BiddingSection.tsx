import {
  Card,
  Space,
  Typography,
  Progress,
  Statistic,
  Divider,
  Alert,
  Row,
  Col,
  Button,
} from "antd";
import {
  TrophyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { useMemo, useRef, useEffect } from "react";
import type { StatisticProps } from "antd";
import { WalletOutlined } from "@ant-design/icons";
import CountUp from "react-countup";

const { Text, Title } = Typography;
const { Timer } = Statistic;

export const BiddingSection = ({
  isHighestBidder,
  isEnded,
  currentPrice,
  handleBid,
  submitting,
  percent,
  deadline,
  setPercent,
  currentBalance,
  handleGenerateItem,
}: any) => {
  const baseBalance = 5000;
  const balanceChange = currentBalance - baseBalance;
  const percentageChange = (balanceChange / baseBalance) * 100;

  const previousBalance = useRef(currentBalance);

  useEffect(() => {
    previousBalance.current = currentBalance;
  }, [currentBalance]);

  const balanceFormatter: StatisticProps["formatter"] = (value) => (
    <CountUp
      start={previousBalance.current}
      end={Number(value)}
      separator=","
    />
  );

  const balanceDisplay = useMemo(() => {
    if (currentBalance === undefined) {
      return <Text type="secondary">Loading balance...</Text>;
    }

    const isProfit = balanceChange > 0;
    const isLoss = balanceChange < 0;

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <WalletOutlined style={{ fontSize: "1.5rem", color: "#595959" }} />
        <div>
          <Statistic
            title={null}
            value={currentBalance}
            formatter={balanceFormatter}
            style={{ fontSize: "1.2rem", fontWeight: "bold" }}
          />
          <span
            style={{
              color: isProfit ? "#52c41a" : isLoss ? "#f5222d" : "#595959",
              marginTop: "4px",
            }}
          >
            {isProfit && <ArrowUpOutlined />} {isLoss && <ArrowDownOutlined />}{" "}
            {balanceChange > 0 ? "+" : ""}
            {balanceChange.toLocaleString()} ({percentageChange > 0 ? "+" : ""}
            {percentageChange.toFixed(1)}%)
          </span>
        </div>
      </div>
    );
  }, [currentBalance, balanceChange, percentageChange]);

  return (
    <Card
      variant="outlined"
      style={{
        borderColor: isHighestBidder ? "#f6ffed" : "#f0f0f0",
        background: isHighestBidder ? "#f6ffed" : undefined,
      }}
    >
      <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
        {balanceDisplay}
        <div style={{ width: "100%" }}>
          <Text strong>Time Remaining</Text>
          <Progress
            percent={percent}
            showInfo={false}
            status={isEnded ? "exception" : "active"}
          />
          <Timer
            type="countdown"
            value={deadline}
            format="ss"
            style={{ display: "none" }}
            onChange={(value) => {
              if (value) {
                setPercent(Math.round(Number(value) / 100) - 1);
              }
            }}
          />
        </div>

        <Divider style={{ margin: "12px 0" }} />

        {isEnded ? (
          <Alert
            title="Auction Ended"
            description={
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', textAlign: 'center' }}>
                    <div>This auction has closed.</div>
                    <Button type="primary" onClick={handleGenerateItem} style={{ width: 'fit-content' }}>
                        Next Auction
                    </Button>
                </div>
            }
            type="info"
            showIcon
          />
        ) : (
          <div style={{ position: "relative" }}>
            {isHighestBidder && (
              <div
                style={{
                  position: "absolute",
                  top: -8,
                  left: -8,
                  right: -8,
                  bottom: -8,
                  backgroundColor: "rgba(255, 255, 255, 0.85)",
                  zIndex: 10,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 8,
                  backdropFilter: "blur(4px)",
                  textAlign: "center",
                }}
              >
                <TrophyOutlined
                  style={{
                    fontSize: 48,
                    color: "#52c41a",
                    marginBottom: 16,
                  }}
                />
                <Title level={4} style={{ color: "#52c41a", margin: 0 }}>
                  Highest Bidder!
                </Title>
                <Text type="secondary">
                  You currently hold the winning bid.
                </Text>
              </div>
            )}
            <Row gutter={[12, 12]}>
              {[
                { pct: 5, color: "#13c2c2" },
                { pct: 25, color: "#52c41a" },
                { pct: 50, color: "#fa8c16" },
                { pct: 100, color: "#f5222d" },
              ].map((item) => (
                <Col span={12} xs={12} sm={6} key={item.pct}>
                  <Button
                    type="primary"
                    block
                    disabled={submitting || isHighestBidder}
                    onClick={() => {
                      const increase = Math.max(
                        1,
                        Math.ceil(currentPrice * (item.pct / 100)),
                      );
                      handleBid(currentPrice + increase);
                    }}
                    style={{
                      backgroundColor: item.color,
                      borderColor: item.color,
                      borderRadius: 4,
                      height: "auto",
                      aspectRatio: "1 / 1",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                    }}
                  >
                    +{item.pct}%
                  </Button>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Space>
    </Card>
  );
};
