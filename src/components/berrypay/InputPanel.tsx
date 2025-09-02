import React from 'react';
import { Component } from './Component';
import { Component1 } from './Component1';
import { Variant6 } from './Variant6';
import { VariantHoverTrueWrapper } from './VariantHoverTrueWrapper';
import './style.css';

export const Section = (): JSX.Element => {
  return (
    <div className="section">
      <div className="heading">
        <div className="div">결제 수단 추천</div>
      </div>

      <div className="container">
        <div className="label">
          <div className="text-wrapper-2">가맹점</div>
        </div>

        <div className="div-wrapper">
          <div className="text-wrapper-3">
            보유 카드/멤버십 기준으로 추천해요
          </div>
        </div>

        <div className="input">
          <div className="container-2">
            <div className="text-wrapper-4">가맹점명 입력</div>
          </div>
        </div>
      </div>

      <div className="container-3">
        <div className="label-2">
          <div className="text-wrapper-5">결제 금액</div>
        </div>

        <div className="container-wrapper">
          <div className="container-4">
            <div className="text-wrapper-6">10,000</div>
          </div>
        </div>

        <div className="view">
          <Component
            className="component-2"
            text="₩5,000"
            textClassName="component-instance"
            variant="one"
          />
          <Component
            className="component-2"
            text="₩10,000"
            textClassName="component-instance"
            variant="one"
          />
          <Component
            className="component-2"
            text="₩30,000"
            textClassName="component-instance"
            variant="one"
          />
        </div>
      </div>

      <div className="container-5">
        <div className="container-6">
          <div className="text-wrapper-7">기프티콘 사용</div>
        </div>

        <div className="background">
          <div className="background-shadow" />
        </div>
      </div>

      <div className="status">
        <div className="component-wrapper">
          <Component1 className="component-1" />
        </div>

        <div className="container-7">
          <p className="p">이번 달 예산 초과 위험이에요. (87%)</p>
        </div>
      </div>

      <div className="status-2">
        <div className="component-wrapper">
          <Variant6 className="component-1" />
        </div>

        <div className="container-8">
          <p className="text-wrapper-8">
            기프티콘 만료 임박! 사용을 권장해요. (D-3)
          </p>
        </div>
      </div>

      <div className="component-3-wrapper">
        <VariantHoverTrueWrapper text="추천 검색하기" variant="one" />
      </div>
    </div>
  );
};
