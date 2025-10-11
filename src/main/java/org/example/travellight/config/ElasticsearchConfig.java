package org.example.travellight.config;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Elasticsearch 설정 클래스
 * - ELK 스택에서 로그 조회를 위한 클라이언트 설정
 */
@Configuration
public class ElasticsearchConfig {

    @Value("${elasticsearch.host:localhost}")
    private String elasticsearchHost;

    @Value("${elasticsearch.port:9200}")
    private int elasticsearchPort;

    /**
     * Elasticsearch REST 클라이언트 빈 생성
     */
    @Bean
    public RestClient restClient() {
        return RestClient.builder(
                new HttpHost(elasticsearchHost, elasticsearchPort, "http")
        ).build();
    }

    /**
     * Elasticsearch Java Client 빈 생성
     * - 로그 검색 및 조회에 사용
     */
    @Bean
    public ElasticsearchClient elasticsearchClient(RestClient restClient) {
        RestClientTransport transport = new RestClientTransport(
                restClient,
                new JacksonJsonpMapper()
        );
        return new ElasticsearchClient(transport);
    }
}
