import { Space, Typography, Tag, Card, Statistic } from "antd";
import { ItemGenerator } from "./ItemGenerator";

const { Title, Text } = Typography;

export const ActiveLot = ({
  currentItem,
  currentPrice,
  isHighestBidder,
}: any) => (
  <Space orientation="vertical" size="large" style={{ width: "100%" }}>
    <div>
      <Text type="secondary" style={{ fontSize: 14 }}>
        ACTIVE LOT
      </Text>
      <Title level={2} style={{ marginTop: 4, marginBottom: 8 }}>
        <ItemGenerator name={currentItem.name} />
      </Title>
      <Tag>{`Lot #${currentItem.scheduledId.toString()}`}</Tag>
    </div>

    <Card
      type="inner"
      styles={{
        body: {
          background: !currentItem?.highestBidderId
            ? "#fffbe6"
            : isHighestBidder
              ? "#f6ffed"
              : "#fff1f0",
          border: !currentItem?.highestBidderId
            ? "1px solid #ffe58f"
            : isHighestBidder
              ? "1px solid #b7eb8f"
              : "1px solid #ffccc7",
        },
      }}
    >
      <Statistic
        title={
          <Space>
            {!currentItem?.highestBidderId
              ? "Starting Price"
              : "Current Highest Bid"}
            {!currentItem?.highestBidderId && (
              <Tag color="warning">NO BIDS</Tag>
            )}
            {currentItem?.highestBidderId && isHighestBidder && (
              <Tag color="success">WINNING</Tag>
            )}
            {currentItem?.highestBidderId && !isHighestBidder && (
              <Tag color="error">OUTBID</Tag>
            )}
          </Space>
        }
        value={currentPrice}
        precision={0}
        prefix="$"
        styles={{
          content: {
            color: !currentItem?.highestBidderId
              ? "#faad14"
              : isHighestBidder
                ? "#3f8600"
                : "#cf1322",
            fontWeight: "bold",
          },
        }}
      />
    </Card>
  </Space>
);
