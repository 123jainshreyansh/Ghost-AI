import { CANVAS_NODE_COLOR_PALETTE, type CanvasEdge, type CanvasNode, type CanvasShape } from "@/types/canvas";
import { MarkerType } from "@xyflow/react";

export type CanvasTemplate = {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
};

export const OPEN_STARTER_TEMPLATES_EVENT = "ghost:open-starter-templates";

type TemplateColorId = (typeof CANVAS_NODE_COLOR_PALETTE)[number]["id"];

function createNode(
  id: string,
  label: string,
  x: number,
  y: number,
  colorId: TemplateColorId,
  shape: CanvasShape = "rectangle",
  width = 144,
  height = 68,
): CanvasNode {
  const color = CANVAS_NODE_COLOR_PALETTE.find((candidate) => candidate.id === colorId) ?? CANVAS_NODE_COLOR_PALETTE[0];
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    style: { width, height },
    data: { label, color: color.background, textColor: color.text, shape },
  };
}

function createEdge(id: string, source: string, target: string, label = ""): CanvasEdge {
  return {
    id,
    type: "canvasEdge",
    source,
    target,
    sourceHandle: "source-right",
    targetHandle: "target-left",
    markerEnd: { type: MarkerType.ArrowClosed, color: "var(--foreground)" },
    style: { stroke: "var(--foreground)", strokeWidth: 1.75, strokeLinecap: "round" },
    data: { label },
  };
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices",
    description: "A gateway routes requests to identity, order, and payment services. Events flow through a shared bus into a central database.",
    nodes: [
      createNode("client", "Client", 0, 130, "blue", "pill", 126, 62),
      createNode("gateway", "API Gateway", 190, 130, "violet", "hexagon", 156, 72),
      createNode("identity", "Identity", 430, 20, "graphite", "rectangle"),
      createNode("orders", "Orders", 430, 130, "teal", "rectangle"),
      createNode("payments", "Payments", 430, 240, "amber", "rectangle"),
      createNode("event-bus", "Event Bus", 680, 130, "rose", "cylinder", 148, 76),
      createNode("database", "Database", 916, 130, "graphite", "cylinder", 148, 76),
    ],
    edges: [
      createEdge("client-gateway", "client", "gateway", "HTTPS"),
      createEdge("gateway-identity", "gateway", "identity"),
      createEdge("gateway-orders", "gateway", "orders"),
      createEdge("gateway-payments", "gateway", "payments"),
      createEdge("orders-events", "orders", "event-bus", "events"),
      createEdge("payments-events", "payments", "event-bus", "events"),
      createEdge("events-database", "event-bus", "database"),
    ],
  },
  {
    id: "cicd-pipeline",
    name: "CI/CD Pipeline",
    description: "Trace a source change through automated builds and tests to a staged release and production deployment.",
    nodes: [
      createNode("developer", "Developer", 0, 116, "graphite", "pill", 136, 64),
      createNode("repository", "Repository", 196, 116, "violet", "cylinder", 148, 72),
      createNode("build", "Build", 410, 116, "blue", "rectangle"),
      createNode("tests", "Tests", 624, 116, "teal", "diamond", 144, 76),
      createNode("release", "Release", 838, 116, "amber", "rectangle"),
      createNode("production", "Production", 1052, 116, "rose", "pill", 148, 64),
    ],
    edges: [
      createEdge("developer-repository", "developer", "repository", "push"),
      createEdge("repository-build", "repository", "build"),
      createEdge("build-tests", "build", "tests"),
      createEdge("tests-release", "tests", "release", "pass"),
      createEdge("release-production", "release", "production", "deploy"),
    ],
  },
  {
    id: "event-driven-system",
    name: "Event-Driven System",
    description: "A central event broker routes messages to inventory, notifications, and analytics consumers, then records them in an event store.",
    nodes: [
      createNode("producer", "Producer", 0, 126, "blue", "pill", 140, 64),
      createNode("broker", "Event Broker", 236, 116, "violet", "cylinder", 158, 80),
      createNode("inventory", "Inventory", 520, 12, "teal", "rectangle"),
      createNode("notifications", "Notifications", 520, 126, "amber", "rectangle", 158, 68),
      createNode("analytics", "Analytics", 520, 240, "rose", "rectangle"),
      createNode("event-store", "Event Store", 804, 126, "graphite", "cylinder", 158, 80),
    ],
    edges: [
      createEdge("producer-broker", "producer", "broker", "publish"),
      createEdge("broker-inventory", "broker", "inventory"),
      createEdge("broker-notifications", "broker", "notifications"),
      createEdge("broker-analytics", "broker", "analytics"),
      createEdge("inventory-store", "inventory", "event-store"),
      createEdge("notifications-store", "notifications", "event-store"),
      createEdge("analytics-store", "analytics", "event-store"),
    ],
  },
];
