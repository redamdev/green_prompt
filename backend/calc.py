

def model_choice(complexity):
    if float(complexity[0]) > 0.6:
        return 'o1'
    elif float(complexity[0]) > 0.4:
        return 'gpt-4o'
    else:
        return 'gpt-4o-mini'
    

def estimate_tokens(text):
    return max(1, len(text) // 4)

def get_model_pricing(model):
    pricing = {
        'gpt-4o': {'input_cost_per_1k': 0.0025, 'output_cost_per_1k': 0.01, 'co2_per_1k': 45},
        'gpt-4o-mini': {'input_cost_per_1k': 0.00015, 'output_cost_per_1k': 0.0006, 'co2_per_1k': 15},
        'o1': {'input_cost_per_1k': 0.01, 'output_cost_per_1k': 0.04, 'co2_per_1k': 80}
    }
    return pricing[model]

def calculate(model, old_model, prompt, response):
    
    if old_model is None:
        return [0,0]
    prompt_tokens = estimate_tokens(prompt)
    response_tokens = estimate_tokens(response)

    model_pricing = get_model_pricing(model)
    old_model_pricing = get_model_pricing(old_model)

    model_cost = (prompt_tokens * model_pricing['input_cost_per_1k'] +
                  response_tokens * model_pricing['output_cost_per_1k']) / 1000
    old_model_cost = (prompt_tokens * old_model_pricing['input_cost_per_1k'] +
                      response_tokens * old_model_pricing['output_cost_per_1k']) / 1000


    model_co2 = (prompt_tokens + response_tokens) * model_pricing['co2_per_1k'] / 1000
    old_model_co2 = (prompt_tokens + response_tokens) * old_model_pricing['co2_per_1k'] / 1000

    if old_model_co2 > model_co2 and old_model_cost>model_cost:
        return [old_model_cost-model_cost,old_model_co2-model_co2]
    else:
        return [0,0]
