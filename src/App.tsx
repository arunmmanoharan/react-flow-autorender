import "reactflow/dist/style.css";

import {useEffect, useState} from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant, ReactFlowProvider,
} from 'reactflow';

import { jsonDecode } from "@/utils/base";

import { ControlPanel } from "./components/ControlPanel";
import { kEdgeTypes } from "./components/Edges";
import { kNodeTypes } from "./components/Nodes";
import { ReactflowInstance } from "./components/ReactflowInstance";
import defaultWorkflow from "./data/data.json";
import { workflow2reactflow } from "./data/convert";
import { kDefaultLayoutConfig, ReactflowLayoutConfig } from "./layout/node";
import { useAutoLayout } from "./layout/useAutoLayout";

const EditWorkFlow = () => {
  const [from, setFrom] = useState<string>("A");
  const [to, setTo] = useState<string>("H");
  const [workflow, setWorkflow] = useState(defaultWorkflow);
  const [nodes, _setNodes, onNodesChange] = useNodesState([]);
  const [edges, _setEdges, onEdgesChange] = useEdgesState([]);

  const { layout, layouting } = useAutoLayout();

  const layoutReactflow = async (
    props: ReactflowLayoutConfig & {
      workflow: string;
    }
  ) => {
    if (layouting) {
      return;
    }
    const input = props.workflow;
    const data = jsonDecode(input);

    if (!data) {
      alert("Invalid workflow JSON data");
      return;
    }
    const workflow = workflow2reactflow(data);
    await layout({ ...workflow, ...props });
  };

  useEffect(() => {
    const { nodes, edges } = workflow2reactflow(workflow);
    layout({ nodes, edges, ...kDefaultLayoutConfig });
  }, [workflow]);

  const handleAddWorkflow = () => {
    setWorkflow({
      nodes: workflow.nodes.concat({ id: to, type: 'base' }),
      edges: workflow.edges.concat({ id: `${from}#${to}#0`, source: from, target: to, sourceHandle: `${from}#source#0`, targetHandle: `${to}#target#0` }),
    })
  }

  console.log('nodes', nodes);
  console.log('edges', edges);



  return (
      <>
        <div style={{marginBottom: '40px'}}>
        <input value={from} onChange={e => setFrom(e.target.value)}/>
        <input value={to} onChange={e => setTo(e.target.value)}/>
        <button onClick={handleAddWorkflow}>Add Node</button>
        </div>
    <div
      style={{
        width: "100vw",
        height: "500px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={kNodeTypes}
        edgeTypes={kEdgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      >
        <Background id="0" color="#ccc" variant={BackgroundVariant.Dots} />
        <ReactflowInstance />
        <Controls />
        <MiniMap
          pannable
          zoomable
          maskColor="transparent"
          maskStrokeColor="black"
          maskStrokeWidth={10}
        />
        <ControlPanel layoutReactflow={layoutReactflow} />
      </ReactFlow>
    </div>
      </>
  );
};

export const WorkFlow = () => {
  return (
    <ReactFlowProvider>
      <EditWorkFlow />
    </ReactFlowProvider>
  );
};
