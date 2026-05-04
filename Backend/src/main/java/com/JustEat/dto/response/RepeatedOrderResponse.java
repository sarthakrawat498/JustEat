package com.JustEat.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.apache.coyote.Response;

import java.util.List;

@Getter
@Setter
@Builder
public class RepeatedOrderResponse {

    private List<RepeatedItem> unavailableItems;
    private List<RepeatedItem> priceChangedItems;
    private List<RepeatedItem> addedItems;
}
