/**
 * This function return url based on watson next_url response
 */
const checkUrl = (nxt_url, watson) => {
  if (nxt_url !== "") {
    return `https://gateway.watsonplatform.net/assistant/api${nxt_url}`;
  } else {
    return `https://gateway.watsonplatform.net/assistant/api/v1/workspaces/${
      watson.workspace_id
    }/logs?cursor=&version=${watson.version}`;
  }
};

const formatLogs = logs => {
  return logs.map(r => {
    return {
      workspace_id: r.workspace_id,
      request_timestamp: r.request_timestamp,
      response_timestamp: r.response_timestamp,
      log_id: r.log_id,
      conversation_id: r.response.context.conversation_id,
      input: r.response.input.text,
      entities: JSON.stringify(r.response.entities),
      "intent and confidence": JSON.stringify(r.response.intents[0]),
      output: r.response.output.text
    };
  });
};

module.exports = {
  checkUrl,
  formatLogs
};
